---
title: "ros2_controllers 官方文档（二）：轮式移动机器人控制器"
published: 2026-08-31
description: "ros2_controllers 轮式移动机器人控制器中文翻译：差速驱动、麦克纳姆轮、全向轮、转向控制器库与三轮车控制器。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译", "ros2_controllers", "控制器"]
category: ROS2专题
slug: ros2-controllers-wheeled-mobile-robots
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 6
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「轮式移动机器人控制器」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

# 3. 轮式移动机器人控制器（Controllers for Wheeled Mobile Robots）

## 3.1 差速驱动控制器（Differential Drive Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/diff_drive_controller/doc/userdoc.html>

用于差速驱动移动机器人的控制器。

作为输入，它接收机器人机体的速度命令，并将其转换为差速驱动底盘的轮速命令。

里程计由硬件反馈计算并发布。

关于移动机器人运动学以及此处所用术语的介绍，参见 [轮式移动机器人运动学](#21-轮式移动机器人运动学wheeled-mobile-robot-kinematics)。

### 其他特性

- 实时安全（Realtime-safe）实现。
- 里程计发布。
- 任务空间（task-space）速度、加速度和加加速度（jerk）限制。
- 命令超时后自动停止。
- 可链式控制器（Chainable Controller）。

### 3.1.1 控制器接口说明

#### 参考接口（References）

当控制器处于链式（chained）模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/velocity` double，单位 m/s
- `<controller_name>/angular/velocity` double，单位 rad/s

两者共同表示机体速度旋量（在非链式模式下，该旋量来自 ~/cmd_vel）。`<controller_name>` 通常设为 `diff_drive_controller`。

#### 反馈（Feedback）

反馈接口类型使用关节的位置（`hardware_interface::HW_IF_POSITION`）或速度（`hardware_interface::HW_IF_VELOCITY`，当参数 `position_feedback=false` 时）。除非设置参数 `open_loop=true`，此时不使用外部状态接口（改用被命令的速度来计算里程计）。

#### 输出（Output）

使用关节的速度（`hardware_interface::HW_IF_VELOCITY`）。

### 3.1.2 ROS 2 接口

#### 订阅者

**~/cmd_vel** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 分量和角速度的 z 分量，其他分量的速度被忽略。

#### 发布者

**~/odom** `[nav_msgs::msg::Odometry]`

表示对机器人在自由空间中位置和速度的估计。

**/tf** `[tf2_msgs::msg::TFMessage]`

tf 树。仅当 `enable_odom_tf=true` 时发布。

**~/cmd_vel_out** `[geometry_msgs/msg/TwistStamped]`

已应用限幅后的控制器速度命令。仅当 `publish_limited_velocity=true` 时发布。

### 3.1.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`left_wheel_names`** (string_array)

左侧车轮关节的名称。

- 默认值：`{}`
- 约束：参数非空

**`right_wheel_names`** (string_array)

右侧车轮关节的名称。

- 默认值：`{}`
- 约束：参数非空

**`wheel_separation`** (double)

左右轮之间的最短距离。如果此参数错误，机器人在转弯时行为将不正确。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_radius`** (double)

轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转。如果此参数错误，机器人将比预期移动得更快或更慢。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_separation_multiplier`** (double)

当实际轮距与 `wheel_separation` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`left_wheel_radius_multiplier`** (double)

当左轮半径与 `wheel_radius` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`right_wheel_radius_multiplier`** (double)

当右轮半径与 `wheel_radius` 参数中的标称值不同时的修正系数。

- 默认值：1.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 tf_prefix 附加到 tf 帧 ID 上。

- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 默认值：""

**`odom_frame_id`** (string)

里程计帧的名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，它是里程计帧的子帧。

- 默认值："base_link"

**`pose_covariance_diagonal`** (double_array)

机器人位姿编码器输出的里程计协方差。这些值应根据你机器人的采样里程计数据进行调优，但这些值是很好的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`twist_covariance_diagonal`** (double_array)

机器人速度编码器输出的里程计协方差。这些值应根据你机器人的采样里程计数据进行调优，但这些值是很好的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

若设为 true，机器人的里程计将从命令值计算，而非从反馈计算。

- 默认值：false

**`position_feedback`** (bool)

硬件是否有位置反馈。

- 默认值：true

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 默认值：true

**`cmd_vel_timeout`** (double)

超时时间（秒），超过该时间后，`cmd_vel` 话题上收到的命令被视为过期。值 0.0 禁用超时。

- 默认值：0.5

**`publish_limited_velocity`** (bool)

发布限幅后的速度值。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计平均速度的滚动窗口大小。

- 默认值：10

**`publish_rate`** (double)

里程计和 TF 消息的发布频率（Hz）。

- 默认值：50.0

**`linear.x`**

线性 `x` 轴的关节限位结构。

- `linear.x.has_velocity_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.has_acceleration_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.has_jerk_limits` (bool)：已弃用，可通过将相应限位设为 `.NAN` 来停用。默认：true
- `linear.x.max_velocity` (double)：默认 `std::numeric_limits<double>::quiet_NaN()`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.min_velocity` (double)：默认 `std::numeric_limits<double>::quiet_NaN()`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.max_acceleration` (double)：前进方向的最大加速度。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.max_deceleration` (double)：前进方向的最大减速度。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.min_acceleration` (double)：已弃用，改用 max_deceleration。默认 `NaN`
- `linear.x.max_acceleration_reverse` (double)：后退方向的最大加速度。若未设置，使用 -max_acceleration。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `linear.x.max_deceleration_reverse` (double)：后退方向的最大减速度。若未设置，使用 -max_deceleration。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.max_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `linear.x.min_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`

**`angular.z`**

绕 `z` 轴旋转的关节限位结构。

- `angular.z.has_velocity_limits` (bool)：已弃用。默认：true
- `angular.z.has_acceleration_limits` (bool)：已弃用。默认：true
- `angular.z.has_jerk_limits` (bool)：已弃用。默认：true
- `angular.z.max_velocity` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.min_velocity` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.max_acceleration` (double)：正方向的最大加速度。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.max_deceleration` (double)：正方向的最大减速度。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.min_acceleration` (double)：已弃用，改用 max_deceleration。默认 `NaN`
- `angular.z.max_acceleration_reverse` (double)：负方向的最大加速度。若未设置，使用 -max_acceleration。默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`
- `angular.z.max_deceleration_reverse` (double)：负方向的最大减速度。若未设置，使用 -max_deceleration。默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.max_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::gt_eq_or_nan: 0.0`
- `angular.z.min_jerk` (double)：默认 `NaN`；自定义校验：`control_filters::lt_eq_or_nan: 0.0`

该控制器的示例参数文件可在 test 目录中找到：

```yaml
test_diff_drive_controller:
  ros__parameters:
    left_wheel_names: ["left_wheels"]
    right_wheel_names: ["right_wheels"]

    wheel_separation: 0.40
    wheel_radius: 0.02

    wheel_separation_multiplier: 1.0
    left_wheel_radius_multiplier: 1.0
    right_wheel_radius_multiplier: 1.0

    odom_frame_id: odom
    base_frame_id: base_link
    pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    twist_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    position_feedback: false
    open_loop: true
    enable_odom_tf: true

    cmd_vel_timeout: 0.5 # seconds
    publish_limited_velocity: true
    velocity_rolling_window_size: 10

    linear.x.max_velocity: .NAN
    linear.x.min_velocity: .NAN
    linear.x.max_acceleration: .NAN
    linear.x.max_deceleration: .NAN
    linear.x.max_acceleration_reverse: .NAN
    linear.x.max_deceleration_reverse: .NAN
    linear.x.max_jerk: .NAN
    linear.x.min_jerk: .NAN

    angular.z.max_velocity: .NAN
    angular.z.min_velocity: .NAN
    angular.z.max_acceleration: .NAN
    angular.z.max_deceleration: .NAN
    angular.z.max_acceleration_reverse: .NAN
    angular.z.max_deceleration_reverse: .NAN
    angular.z.max_jerk: .NAN
    angular.z.min_jerk: .NAN
```


## 3.2 麦克纳姆轮驱动控制器（Mecanum Drive Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/mecanum_drive_controller/doc/userdoc.html>

用于麦克纳姆轮驱动（四个麦克纳姆轮）移动机器人控制器的共享功能库。该库实现通用的里程计和更新方法，并定义主要接口。

### 3.2.1 控制器的执行逻辑

控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x`、`y` 和角速度 `z` 分量。其他分量的值被忽略。在链式（chain）模式下，控制器提供三个参考接口：一个用于线速度，一个用于转向角位置。其他相关特性：

- 以 Odometry 和 TF 消息形式发布里程计；
- 基于参数的输入命令超时。

关于里程计计算的说明：在 DiffDriveController 中，速度会被滤波，但我们更倾向于返回原始值，让用户自行进行后处理。我们倾向于这样做，因为滤波会引入延迟（这使得行为曲线的解读和比较变得困难）。

### 3.2.2 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/x/velocity`，单位 m/s
- `<controller_name>/linear/y/velocity`，单位 m/s
- `<controller_name>/angular/z/velocity`，单位 rad/s

#### 命令接口（Commands）

- `<*_wheel_command_joint_name>/velocity`，单位 rad/s

#### 状态接口（States）

- `<joint_name>/velocity`，单位 rad/s

> **注意**
>
> `joint_name` 可以是 `*_wheel_state_joint_name` 参数指定的关节名（如果使用），否则为 `*_wheel_command_joint_name`。

#### 订阅者

当控制器不处于链式模式（`in_chained_mode == false`）时使用。

- `<controller_name>/reference` `[geometry_msgs/msg/TwistStamped]`

#### 发布者

- `<controller_name>/odometry` `[nav_msgs/msg/Odometry]`
- `<controller_name>/tf_odometry` `[tf2_msgs/msg/TFMessage]`
- `<controller_name>/controller_state` `[control_msgs/msg/MecanumDriveControllerState]`

### 3.2.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`reference_timeout`** (double)

控制器参考值的超时时间，超过后将被重置。这对于参考值未重置可能导致不希望且危险行为的控制器（例如速度控制器）尤其有用。若值为 0，则每次运行后参考值都会被重置。

- 默认值：0.0

**`front_left_wheel_command_joint_name`** (string)

用于命令左前轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`front_right_wheel_command_joint_name`** (string)

用于命令右前轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`rear_right_wheel_command_joint_name`** (string)

用于命令右后轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`rear_left_wheel_command_joint_name`** (string)

用于命令左后轮的关节名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`front_left_wheel_state_joint_name`** (string)

（可选）指定用于读取左前轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`front_right_wheel_state_joint_name`** (string)

（可选）指定用于读取右前轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`rear_right_wheel_state_joint_name`** (string)

（可选）指定用于读取右后轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`rear_left_wheel_state_joint_name`** (string)

（可选）指定用于读取左后轮状态的关节名称。仅当状态关节与命令关节不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：""

**`kinematics.base_frame_offset.x`** (double)

base_frame（base_link 帧）沿 X 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.base_frame_offset.y`** (double)

base_frame（base_link 帧）沿 Y 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.base_frame_offset.theta`** (double)

base_frame（base_link 帧）沿 Theta 轴的偏移量。

- 只读：True
- 默认值：0.0

**`kinematics.wheels_radius`** (double)

轮子半径。

- 只读：True
- 默认值：0.0
- 约束：大于 0.0

**`kinematics.sum_of_robot_center_projection_on_X_Y_axis`** (double)

麦克纳姆轮逆运动学（IK）中使用的轮子几何参数。lx 和 ly 分别表示机器人中心到轮子在 x 轴和 y 轴上的投影距离（原点在机器人中心），`sum_of_robot_center_projection_on_X_Y_axis = lx+ly`。

- 只读：True
- 默认值：0.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 `tf_frame_prefix` 附加到 tf 帧 ID 上。更多信息见其参数说明。

- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_frame_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 只读：True
- 默认值：""

**`base_frame_id`** (string)

base_frame_id 设置为该值。

- 只读：True
- 默认值："base_link"

**`odom_frame_id`** (string)

odom_frame_id 设置为该值。

- 只读：True
- 默认值："odom"

**`enable_odom_tf`** (bool)

是否启用向 tf 发布？

- 默认值：true

**`twist_covariance_diagonal`** (double_array)

速度协方差矩阵的对角值。

- 只读：True
- 默认值：{0.1, 0.1, 0.1, 0.1, 0.1, 0.1}

**`pose_covariance_diagonal`** (double_array)

位姿协方差矩阵的对角值。

- 只读：True
- 默认值：{0.1, 0.1, 0.1, 0.1, 0.1, 0.1}

**限位参数（线性 `linear.x` / `linear.y`、角向 `angular.z`）**

与 diff_drive_controller 相同的任务空间限位结构（`max_velocity`、`min_velocity`、`max_acceleration`、`max_deceleration`、`max_acceleration_reverse`、`max_deceleration_reverse`、`max_jerk`、`min_jerk`），默认值均为 `std::numeric_limits<double>::quiet_NaN()`，并带有相应的 `control_filters` 自定义校验（正方向 `gt_eq_or_nan: 0.0`，负方向 `lt_eq_or_nan: 0.0`）。说明：`linear.x.max_acceleration`/`max_deceleration` 描述前进方向；`linear.y` 同理；`angular.z` 描述正方向；`*_reverse` 变体描述后退/负方向，若未设置使用对应的负值。

该控制器的示例参数文件可在 test 目录中找到：

```yaml
/**:
  test_mecanum_drive_controller:
    ros__parameters:
      reference_timeout: 0.9

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "back_right_wheel_joint"
      rear_left_wheel_command_joint_name: "back_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 0.0, y: 0.0, theta: 0.0 }
        wheels_radius: 0.5
        sum_of_robot_center_projection_on_X_Y_axis: 1.0

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      twist_covariance_diagonal: [0.0, 7.0, 14.0, 21.0, 28.0, 35.0]
      pose_covariance_diagonal: [0.0, 6.0, 12.0, 18.0, 24.0, 30.0]


  test_mecanum_drive_controller_with_rotation:
    ros__parameters:
      reference_timeout: 5.0

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "rear_right_wheel_joint"
      rear_left_wheel_command_joint_name: "rear_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 1.0, y: 2.0, theta: 3.0 }
        wheels_radius: 0.05
        sum_of_robot_center_projection_on_X_Y_axis: 0.2925

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      pose_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.001]
      twist_covariance_diagonal: [0.001, 0.001, 0.001, 0.001, 0.001, 0.001]

  test_mecanum_drive_controller_with_limits:
    ros__parameters:
      reference_timeout: 0.9

      front_left_wheel_command_joint_name: "front_left_wheel_joint"
      front_right_wheel_command_joint_name: "front_right_wheel_joint"
      rear_right_wheel_command_joint_name: "back_right_wheel_joint"
      rear_left_wheel_command_joint_name: "back_left_wheel_joint"

      kinematics:
        base_frame_offset: { x: 0.0, y: 0.0, theta: 0.0 }
        wheels_radius: 0.5
        sum_of_robot_center_projection_on_X_Y_axis: 1.0

      base_frame_id: "base_link"
      odom_frame_id: "odom"
      enable_odom_tf: true
      twist_covariance_diagonal: [0.0, 7.0, 14.0, 21.0, 28.0, 35.0]
      pose_covariance_diagonal: [0.0, 6.0, 12.0, 18.0, 24.0, 30.0]

      linear:
        x:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
        y:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
      angular:
        z:
          max_acceleration: 2.0
          max_deceleration: -4.0
          max_acceleration_reverse: -8.0
          max_deceleration_reverse: 10.0
```


## 3.3 全向轮驱动控制器（Omni Wheel Drive Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/omni_wheel_drive_controller/doc/userdoc.html>

用于具有全向驱动（omnidirectional drive）的移动机器人的控制器。

支持使用三个或更多以相同角度间隔均匀分布在圆周上的全向轮。为了更好地理解这一点，请查看《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

该控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x`、`y` 和角速度 `z` 分量。其他分量的值被忽略。

里程计由硬件反馈计算得出并发布。

### 3.3.1 其他特性

- 实时安全实现（Realtime-safe implementation）；
- 里程计发布；
- 命令超时后自动停止。

### 3.3.2 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式时，它暴露以下可被前置控制器命令的参考接口：

- `<controller_name>/linear/x/velocity`，double，单位 m/s
- `<controller_name>/linear/y/velocity`，double，单位 m/s
- `<controller_name>/angular/z/velocity`，double，单位 rad/s

它们共同代表机身角速度（body twist）（在非链式模式下，这可以通过 `~/cmd_vel` 获得）。

#### 状态接口

作为反馈接口类型，使用关节的位置（`hardware_interface::HW_IF_POSITION`）或速度（`hardware_interface::HW_IF_VELOCITY`，当参数 `position_feedback=false` 时）。

#### 命令接口

使用关节的速度（`hardware_interface::HW_IF_VELOCITY`）。

### 3.3.3 ROS 2 接口

#### 订阅者

**`~/cmd_vel`** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 和 y 分量以及角速度的 z 分量。其他分量上的速度被忽略。

#### 发布者

**`~/odom`** `[nav_msgs::msg::Odometry]`

表示机器人自由空间位置和速度的估计。

**`/tf`** `[tf2_msgs::msg::TFMessage]`

tf 树。仅当 `enable_odom_tf=true` 时发布。

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

**`wheel_offset`** (double)

第一个轮子与机器人 x 轴正方向的夹角（弧度）。

- 只读：True

**`wheel_names`** (string_array)

轮子关节的名称，按逆时针顺序给出，从与机器人 x 轴正方向对齐（或偏离 `wheel_offset` 指定值）的轮子开始。

- 只读：True
- 约束：参数非空

**`robot_radius`** (double)

机器人的半径，即机器人中心到轮子的距离。如果该参数错误，机器人在转弯时将不能正确运行。

- 只读：True
- 约束：大于 0.0

**`wheel_radius`** (double)

单个轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转速度。如果该参数错误，机器人将比预期移动得更快或更慢。

- 只读：True
- 约束：大于 0.0

**`tf_frame_prefix_enable`** (bool)

启用或禁用将 tf_prefix 附加到 tf 帧 ID 上。

- 只读：True
- 默认值：true

**`tf_frame_prefix`** (string)

（可选）附加到 tf 帧的前缀，发布前会添加到 odom_id 和 base_frame_id 之前。如果参数为空，将使用控制器的命名空间。

- 只读：True
- 默认值：""

**`odom_frame_id`** (string)

里程计的帧名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 只读：True
- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，是里程计帧的子帧。

- 只读：True
- 默认值："base_link"

**`diagonal_covariance.pose`** (double_array)

机器人编码器输出对应位姿的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`diagonal_covariance.twist`** (double_array)

机器人编码器输出对应速度的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

如果设为 true，则机器人的里程计将根据命令值而非反馈来计算。

- 只读：True
- 默认值：false

**`position_feedback`** (bool)

仅当 `open_loop` 设为 false 时有效。如果硬件有位置反馈，则将该参数设为 `true`，否则设为 `false`。

- 只读：True
- 默认值：true

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 只读：True
- 默认值：true

**`cmd_vel_timeout`** (double)

超时时间（秒），超过后 `~/cmd_vel` 话题上的输入命令被认为过期。

- 只读：True
- 默认值：0.5

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_omni_wheel_drive_controller:
  ros__parameters:
    wheel_offset: 0.0
    wheel_names:
      [
        "front_wheel_joint",
        "left_wheel_joint",
        "back_wheel_joint",
        "right_wheel_joint",
      ]

    robot_radius: 0.20
    wheel_radius: 0.02

    odom_frame_id: odom
    base_frame_id: base_link
    pose_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
    twist_covariance_diagonal: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    open_loop: true
    position_feedback: false
    enable_odom_tf: true

    cmd_vel_timeout: 0.5
    publish_limited_velocity: true
```


## 3.4 转向控制器库（Steering Controllers Library）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/steering_controllers_library/doc/userdoc.html>

用于具有转向驱动（2 个自由度，即所谓非完整约束 non-holonomic constraints）的移动机器人控制器的共享功能库。

该库实现通用的里程计和更新方法，并定义主要接口。

更新方法只使用逆运动学，不实现任何反馈控制回路，如路径跟踪控制器等。

关于移动机器人运动学的介绍以及此处使用的术语，请参阅《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

### 3.4.1 控制器的执行逻辑

控制器使用速度输入，即带时间戳的 Twist 消息，其中使用线速度 `x` 和角速度 `z` 分量。其他分量的值被忽略。

在链式模式下，控制器提供两个参考接口：一个用于线速度，一个用于转向角位置。其他相关特性：

- 支持前轮转向和后轮转向配置；
- 以 Odometry 和 TF 消息形式发布里程计；
- 基于参数的输入命令超时。

轮子的命令使用 `odometry` 库计算，根据具体的运动学模型计算牵引和转向命令。

### 3.4.2 当前已实现的运动学模型

- Bicycle（自行车）—— 一个转向关节和一个驱动关节；
- Tricycle（三轮车）—— 一个转向关节和两个驱动关节；
- Ackermann（阿克曼）—— 两个转向关节和两个驱动关节。

### 3.4.3 控制器接口说明

#### 参考接口（来自前置控制器）

当控制器处于链式模式（`in_chained_mode == true`）时使用。

- `<controller_name>/linear/velocity`，double，单位 m/s
- `<controller_name>/angular/velocity`，double，单位 rad/s

代表机身角速度（body twist）。

#### 命令接口

- `<steering_joints_names[i]>/position`，double，单位 rad
- `<traction_joints_names[i]>/velocity`，double，单位 rad/s

#### 状态接口

根据 `position_feedback` 的不同，期望的反馈类型不同：

- `position_feedback == true` → `TRACTION_FEEDBACK_TYPE = position`
- `position_feedback == false` → `TRACTION_FEEDBACK_TYPE = velocity`

对应以下状态接口：

- `<steering_joints_names[i]>/position`，double，单位 rad
- `<traction_joints_names[i]>/<TRACTION_FEEDBACK_TYPE>`，double，单位 rad 或 rad/s

#### 订阅者

当控制器不处于链式模式（`in_chained_mode == false`）时使用。

- `<controller_name>/reference` `[geometry_msgs/msg/TwistStamped]`

#### 发布者

- `<controller_name>/odometry` `[nav_msgs/msg/Odometry]`
- `<controller_name>/tf_odometry` `[tf2_msgs/msg/TFMessage]`
- `<controller_name>/controller_state` `[control_msgs/msg/SteeringControllerStatus]`

#### 参数

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

**`reference_timeout`** (double)

控制器参考值的超时时间，超过后将被重置。这对于参考值未重置可能导致不希望且危险行为的控制器（例如速度控制器）尤其有用。若值为 0，则每次运行后参考值都会被重置。

- 默认值：1.0

**`front_steering`** (bool)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：true

**`rear_wheels_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`traction_joints_names`** (string_array)

牵引轮关节的名称。对于具有两个牵引关节的运动学配置，期望的顺序为：右关节、左关节。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`front_wheels_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_names` 或 `steering_joints_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`steering_joints_names`** (string_array)

转向关节的名称。对于具有两个转向关节的运动学配置，期望的顺序为：右关节、左关节。转向轴的方向期望如下：当命令正值转向位置时，机器人应绕车辆 z 轴正方向转向（参见 REP-103）。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`traction_joints_state_names`** (string_array)

（可选）用于读取状态的牵引关节名称。如果未设置，将使用 `traction_joints_names` 中的关节名称。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`rear_wheels_state_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_state_names` 或 `steering_joints_state_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`steering_joints_state_names`** (string_array)

（可选）用于读取状态的转向关节名称。如果未设置，将使用 `steering_joints_names` 中的关节名称。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`front_wheels_state_names`** (string_array)

已弃用（DEPRECATED）：改用 `traction_joints_state_names` 或 `steering_joints_state_names`。

- 只读：True
- 默认值：{}
- 约束：长度小于 5；不包含重复项

**`open_loop`** (bool)

选择里程计计算是使用开环（open-loop）还是反馈（feedback）。

- 默认值：false

**`reduce_wheel_speed_until_steering_reached`** (bool)

在达到转向角度之前降低轮速。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计 twist.linear.x 和 twist.angular.z 速度时取平均的速度样本数量。

- 默认值：10

**`base_frame_id`** (string)

base_frame_id 设置为该值。

- 默认值："base_link"

**`odom_frame_id`** (string)

odom_frame_id 设置为该值。

- 默认值："odom"

**`enable_odom_tf`** (bool)

是否启用向 tf 发布？

- 默认值：true

**`twist_covariance_diagonal`** (double_array)

速度协方差矩阵的对角值。

- 默认值：{0.0, 7.0, 14.0, 21.0, 28.0, 35.0}

**`pose_covariance_diagonal`** (double_array)

位姿协方差矩阵的对角值。

- 默认值：{0.0, 7.0, 14.0, 21.0, 28.0, 35.0}

**`position_feedback`** (bool)

反馈类型的选择，如果 position_feedback 为 false，则使用 `HW_IF_VELOCITY` 作为接口类型；如果 position_feedback 为 true，则使用 `HW_IF_POSITION` 作为接口类型。

- 默认值：false

### 3.4.4 自行车转向控制器（Bicycle Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/bicycle_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和两个轮子的运动学模型，其中一个轴上的轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有一个用于牵引的命令关节和一个用于转向的命令关节。如果您的阿克曼转向车辆在轴上使用差速器（differentials），那么您可能应该使用这个控制器，因为您只能命令一个位于轴中间的虚拟轮的牵引速度和转向角。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheel_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheel_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheel_radius`。

- 只读：True
- 默认值：0.0

**`rear_wheel_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheel_radius`。

- 只读：True
- 默认值：0.0

### 3.4.5 三轮转向控制器（Tricycle Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/tricycle_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和三个轮子的运动学模型，其中一个轴上的两个轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有两个用于牵引的命令关节（每个固定轮一个）和一个用于转向的命令关节。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`wheel_track`** (double)

（已弃用 deprecated）轴距（Axle track），使用 `traction_track_width` 代替。

- 默认值：0.0

**`traction_track_width`** (double)

轴距（Axle track）。

- 默认值：0.0

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheels_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

**`rear_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

### 3.4.6 阿克曼转向控制器（Ackermann Steering Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/ackermann_steering_controller/doc/userdoc.html>

该控制器实现了具有两个轴和四个轮子的运动学模型，其中一个轴上的轮子是固定（牵引/驱动）轮，另一个轴上的轮子是可转向轮。

控制器期望有两个用于牵引的命令关节（每个固定轮一个）和两个用于转向的命令关节（每个轮一个）。

关于控制器执行逻辑和接口的更多细节，请参阅《转向控制器库》（Steering Controller Library）。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

参数化的示例可参考控制器包的 `test` 文件夹。

除了《转向控制器库》的参数外，该控制器还增加了以下参数：

**`front_wheel_track`** (double)

已弃用（DEPRECATED）：使用 `traction_track_width` 或 `steering_track_width`。

- 默认值：0.0

**`steering_track_width`** (double)

（可选）转向轮轮距（track）长度。如果未设置，将使用 `traction_track_width`。

- 默认值：0.0

**`rear_wheel_track`** (double)

已弃用（DEPRECATED）：使用 `traction_track_width` 或 `steering_track_width`。

- 默认值：0.0

**`traction_track_width`** (double)

牵引轮轮距长度。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0

**`wheelbase`** (double)

前后轮之间的距离。详细信息见：<https://en.wikipedia.org/wiki/Wheelbase>

- 默认值：0.0
- 约束：大于 0.0

**`traction_wheels_radius`** (double)

牵引轮半径。

- 默认值：0.0

**`front_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

**`rear_wheels_radius`** (double)

已弃用（DEPRECATED）：使用 `traction_wheels_radius`。

- 默认值：0.0

## 3.5 三轮车控制器（Tricycle Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/tricycle_controller/doc/userdoc.html>

用于具有单个双驱动轮（包括牵引和转向）的移动机器人的控制器。例如，一辆前轮为驱动轮、后轴上有两个随动轮的三轮车机器人。

控制器的输入是机器人 base_link 的 Twist 命令，这些命令被转换为三轮车驱动底盘（tricycle drive base）的牵引和转向命令。里程计由硬件反馈计算得出并发布。

关于移动机器人运动学的介绍以及此处使用的术语，请参阅《轮式移动机器人运动学》（Wheeled Mobile Robot Kinematics）。

**其他特性**

- 实时安全实现；
- 里程计发布；
- 速度、加速度和加加速度限制；
- 命令超时后自动停止。

**ROS 2 接口**

**订阅者**

**`~/cmd_vel`** `[geometry_msgs/msg/TwistStamped]`

控制器的速度命令。控制器提取线速度的 x 分量和角速度的 z 分量。其他分量上的速度被忽略。

**参数**

该控制器使用 generate_parameter_library 来处理其参数。

**`traction_joint_name`** (string)

牵引关节的名称。

- 默认值：""
- 约束：参数非空

**`steering_joint_name`** (string)

转向关节的名称。

- 默认值：""
- 约束：参数非空

**`wheelbase`** (double)

前轮与后轴之间的最短距离。如果该参数错误，机器人在转弯时将不能正确运行。

- 默认值：0.0
- 约束：大于 0.0

**`wheel_radius`** (double)

单个轮子的半径，即轮子尺寸，用于将线速度转换为轮子旋转速度。如果该参数错误，机器人将比预期移动得更快或更慢。

- 默认值：0.0
- 约束：大于 0.0

**`odom_frame_id`** (string)

里程计的帧名称。当控制器发布里程计时，该帧是 `base_frame_id` 的父帧。

- 默认值："odom"

**`base_frame_id`** (string)

机器人基座帧的名称，是里程计帧的子帧。

- 默认值："base_link"

**`pose_covariance_diagonal`** (double_array)

机器人编码器输出对应位姿的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`twist_covariance_diagonal`** (double_array)

机器人编码器输出对应速度的里程计协方差。这些值应根据您机器人的样本里程计数据进行调整，但以下数值是一个不错的起点：`[0.001, 0.001, 0.001, 0.001, 0.001, 0.01]`。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0}

**`open_loop`** (bool)

如果设为 true，则机器人的里程计将根据命令值而非反馈来计算。

- 默认值：false

**`enable_odom_tf`** (bool)

发布 `odom_frame_id` 与 `base_frame_id` 之间的变换。

- 默认值：false

**`odom_only_twist`** (bool)

用于在独立节点中进行位姿积分。

- 默认值：false

**`cmd_vel_timeout`** (int)

超时时间（毫秒），超过后 `cmd_vel` 话题上的输入命令被认为过期。

- 默认值：500

**`publish_ackermann_command`** (bool)

发布受限命令（limited commands）。

- 默认值：false

**`velocity_rolling_window_size`** (int)

用于计算里程计平均速度的滚动窗口大小。

- 默认值：10
- 约束：大于 0

**`traction.max_velocity` / `traction.min_velocity` / `traction.max_acceleration` / `traction.min_acceleration` / `traction.max_deceleration` / `traction.min_deceleration` / `traction.max_jerk` / `traction.min_jerk`** (double)

牵引关节的速度/加速度/减速度/加加速度限位。

- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`steering.max_position` / `steering.min_position` / `steering.max_velocity` / `steering.min_velocity` / `steering.max_acceleration` / `steering.min_acceleration`** (double)

转向关节的位置/速度/加速度限位。

- 默认值：`std::numeric_limits<double>::quiet_NaN()`
