$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$serverScript = Join-Path $projectRoot 'scripts\dev.mjs'
$servicePort = 4177
$logDirectory = Join-Path $projectRoot 'work\local-service'

function Get-ServiceMetadata {
    try {
        return Invoke-RestMethod -Uri "http://127.0.0.1:$servicePort/__dev" -TimeoutSec 2
    } catch { return $null }
}

try {
    $nodeCommand = Get-Command node.exe -ErrorAction Stop
    $nodePath = $nodeCommand.Source
    $version = & $nodePath --version
    if ([int]($version.TrimStart('v').Split('.')[0]) -lt 22) {
        throw 'Node.js 22 or newer is required. Install it from https://nodejs.org/.'
    }

    $listeners = @(Get-NetTCPConnection -LocalPort $servicePort -State Listen -ErrorAction SilentlyContinue)
    foreach ($ownerId in @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $ownerId"
        $metadata = Get-ServiceMetadata
        $matchesEndpoint = $false
        if ($metadata -and $metadata.project) {
            $matchesEndpoint = [IO.Path]::GetFullPath($metadata.project).TrimEnd('\') -ieq $projectRoot
        }
        $matchesAbsoluteScript = $owner.CommandLine -and $owner.CommandLine.Contains($serverScript)
        if ($owner.Name -ine 'node.exe' -or $owner.CommandLine -notmatch 'dev\.mjs' -or (-not $matchesEndpoint -and -not $matchesAbsoluteScript)) {
            throw "Port $servicePort belongs to another service (PID $ownerId). No process was stopped."
        }
        Write-Host "Restarting this project's server (PID $ownerId)..."
        Stop-Process -Id $ownerId -ErrorAction Stop
        Wait-Process -Id $ownerId -Timeout 10 -ErrorAction SilentlyContinue
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
    $stdout = Join-Path $logDirectory 'server.log'
    $stderr = Join-Path $logDirectory 'server-error.log'
    $arguments = @('"' + $serverScript + '"', '--port', "$servicePort", '--lan')
    $serviceProcess = Start-Process -FilePath $nodePath -ArgumentList $arguments -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr -PassThru
    $deadline = (Get-Date).AddSeconds(30)
    $started = $false
    do {
        Start-Sleep -Milliseconds 300
        $serviceProcess.Refresh()
        if ($serviceProcess.HasExited) {
            $details = Get-Content -LiteralPath $stderr -Raw -ErrorAction SilentlyContinue
            throw "Server exited before startup. $details"
        }
        $metadata = Get-ServiceMetadata
        if ($metadata -and $metadata.project -and ([IO.Path]::GetFullPath($metadata.project).TrimEnd('\') -ieq $projectRoot)) {
            $started = $true
            break
        }
    } while ((Get-Date) -lt $deadline)
    if (-not $started) {
        Stop-Process -Id $serviceProcess.Id -ErrorAction SilentlyContinue
        throw "Startup timed out. See $stderr"
    }

    Write-Host ''
    Write-Host 'genle_fractal is running in the background.' -ForegroundColor Green
    Write-Host "Local: http://127.0.0.1:$servicePort/"
    $addresses = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object {
        $_.IPAddress -ne '127.0.0.1' -and $_.IPAddress -notlike '169.254.*' -and $_.AddressState -eq 'Preferred'
    })
    foreach ($address in $addresses) {
        Write-Host "LAN [$($address.InterfaceAlias)]: http://$($address.IPAddress):$servicePort/"
    }
    Write-Host "Logs: $logDirectory"
    Write-Host 'After reboot, double-click the launcher again.'
    exit 0
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
