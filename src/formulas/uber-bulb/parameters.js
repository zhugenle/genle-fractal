// Formula-owned parameter metadata. Keep original names for preset compatibility.
const FORMULA_GROUPS={
  "形态与相位": [
    "形态与相位",
    "采用你提供的形态参数。双相位关键帧已固定，自动循环播放。",
    true,
    [
      [
        "Power",
        "幂次 Power",
        2,
        24,
        0.01,
        8
      ],
      [
        "LoopPI",
        "静态相位 LoopPI",
        0,
        6.283185307179586,
        0.000001,
        0.6
      ],
      [
        "LoopPI2",
        "静态相位 LoopPI2",
        0,
        6.283185307179586,
        0.000001,
        3.1415
      ],
      [
        "ZMultiplier",
        "Z 倍率",
        -1,
        1,
        0.000001,
        -1
      ],
      [
        "PrevVecMul",
        "前向量混合",
        -2,
        2,
        0.000001,
        0
      ],
      [
        "OldVecMul",
        "旧向量混合",
        -2,
        2,
        0.000001,
        0
      ],
      [
        "Implode",
        "内收 Implode",
        -2,
        2,
        0.01,
        0
      ],
      [
        "Explode",
        "外扩 Explode",
        -2,
        2,
        0.01,
        1
      ],
      [
        "Iterations",
        "迭代次数",
        1,
        100,
        1,
        10
      ],
      [
        "Bailout",
        "逃逸阈值",
        1,
        300,
        0.1,
        20
      ]
    ]
  ],
  "动画关键帧": [
    "动画关键帧",
    "参考 GIF 区间已录入，默认线性插值。旋转循环与周期相位模式使用独立动画。",
    false,
    [
      [
        "Loop1Start",
        "LoopPI 起始",
        0,
        6.283185307179586,
        0.000001,
        1.695
      ],
      [
        "Loop1End",
        "LoopPI 结束",
        0,
        6.283185307179586,
        0.000001,
        0.129
      ],
      [
        "Loop2Start",
        "LoopPI2 起始",
        0,
        6.283185307179586,
        0.000001,
        3.14
      ],
      [
        "Loop2End",
        "LoopPI2 结束",
        0,
        6.283185307179586,
        0.000001,
        0
      ]
    ]
  ],
  "旋转与位置": [
    "旋转与位置",
    "原公式的三个旋转发生在每次迭代内，会改变结构。",
    false,
    [
      [
        "AngXY",
        "迭代旋转 XY",
        -180,
        180,
        0.1,
        0
      ],
      [
        "AngYZ",
        "迭代旋转 YZ",
        -180,
        180,
        0.1,
        0
      ],
      [
        "AngXZ",
        "迭代旋转 XZ",
        -180,
        180,
        0.1,
        0
      ],
      [
        "AbsoluteScale",
        "公式缩放",
        0.01,
        5,
        0.001,
        0.33
      ],
      [
        "AbsoluteX",
        "位置 X",
        -10,
        10,
        0.1,
        0
      ],
      [
        "AbsoluteY",
        "位置 Y",
        -10,
        10,
        0.1,
        0
      ],
      [
        "AbsoluteZ",
        "位置 Z",
        -10,
        10,
        0.1,
        0
      ]
    ]
  ],
  "球面变换": [
    "球面变换",
    "MinRad 与 MaxRad 均为 1、Radius 为 1 时，此变换保持原点不变。",
    false,
    [
      [
        "Radius",
        "Radius",
        0.001,
        10,
        0.001,
        1
      ],
      [
        "MinRad",
        "MinRad",
        0.000001,
        5,
        0.001,
        1
      ],
      [
        "MaxRad",
        "MaxRad",
        0.000001,
        100,
        0.001,
        1
      ],
      [
        "Xcen",
        "中心 X",
        -5,
        5,
        0.01,
        1
      ],
      [
        "Ycen",
        "中心 Y",
        -5,
        5,
        0.01,
        0
      ],
      [
        "Zcen",
        "中心 Z",
        -5,
        5,
        0.01,
        0
      ],
      [
        "nonconformal",
        "反向球面模式",
        "bool",
        0
      ]
    ]
  ],
  "Julia 与实验模式": [
    "Julia 与实验模式",
    "复杂反馈与除法模式使用近似距离估计；发现缺面时减小步进系数。",
    false,
    [
      [
        "JuliaMode",
        "Julia 模式",
        "bool",
        0
      ],
      [
        "JuliaX",
        "Julia X",
        -5,
        5,
        0.01,
        0
      ],
      [
        "JuliaY",
        "Julia Y",
        -5,
        5,
        0.01,
        0
      ],
      [
        "JuliaZ",
        "Julia Z",
        -5,
        5,
        0.01,
        0
      ],
      [
        "CylindricalMOD",
        "逆柱坐标 Z",
        "bool",
        0
      ],
      [
        "CylindricalNegativeMOD",
        "逆柱坐标 C",
        "bool",
        0
      ],
      [
        "BrotMOD",
        "Brot 模式",
        "select",
        0,
        [
          [
            "MANDEL",
            0
          ],
          [
            "VIRUS · X",
            1
          ],
          [
            "VIRUS2 · Y",
            2
          ],
          [
            "RINGS · Z",
            3
          ]
        ]
      ],
      [
        "BrotFreq",
        "Brot 频率",
        0,
        3,
        0.01,
        1
      ],
      [
        "fractionary",
        "启用除以 Z",
        "bool",
        0
      ]
    ]
  ],
  "轨道着色": [
    "轨道着色",
    "UMode / VMode 对应原公式生成的两个着色坐标。",
    false,
    [
      [
        "ColorIterations",
        "着色迭代次数",
        1,
        100,
        1,
        16
      ],
      [
        "UMode",
        "U 映射",
        "select",
        0,
        [
          [
            "平方根",
            0
          ],
          [
            "对数",
            1
          ],
          [
            "常量",
            2
          ],
          [
            "空间坐标",
            3
          ]
        ]
      ],
      [
        "UScale",
        "U 缩放",
        0,
        10,
        0.001,
        2
      ],
      [
        "VMode",
        "V 映射",
        "select",
        0,
        [
          [
            "平方根",
            0
          ],
          [
            "对数",
            1
          ],
          [
            "常量",
            2
          ],
          [
            "空间坐标",
            3
          ]
        ]
      ],
      [
        "VScale",
        "V 缩放",
        0,
        10,
        0.000001,
        2
      ]
    ]
  ]
};
const REFERENCE_FORMULA_PARAMETERS={AbsoluteScale:.6,ZMultiplier:-.276102,PrevVecMul:-.431555,OldVecMul:-1.211137,Implode:.1,Explode:-.5,LoopPI:1.402738,LoopPI2:2.553983,VScale:1.113689};
const copyFormulaGroup=name=>JSON.parse(JSON.stringify(FORMULA_GROUPS[name]));
