---
title: "ros2_controllers 官方文档（四）：机械臂及其他机器人控制器（下）"
published: 2026-08-31
description: "ros2_controllers 机械臂及其他机器人控制器中文翻译（下）：关节轨迹控制器、运动基元控制器、平行夹爪控制器、PID、位置与速度控制器。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译", "ros2_controllers", "控制器", "机械臂"]
category: ROS2专题
slug: ros2-controllers-manipulators-part-2
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 8
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「关节轨迹、运动基元、平行夹爪、PID、位置与速度控制器」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

## 4.6 关节轨迹控制器（Joint Trajectory Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/userdoc.html>

用于在一组关节上执行关节空间轨迹的控制器。控制器在时间上对点之间进行插值，因此点之间的距离可以是任意的。甚至只包含一个点的轨迹也被接受。轨迹被指定为一组在特定时间点要达到的航点（waypoints），控制器会尽机构所允许的能力尝试执行这些航点。航点由位置以及可选的（可选）速度和加速度组成。

_本文档的部分内容最初以 CC BY 3.0 许可发布在 ROS 1 wiki 上。各节中给出了引用，但已针对 ROS 2 实现进行了改编。_ [1]

### 4.6.1 硬件接口类型

目前，具有 `position`、`velocity`、`acceleration` 和 `effort` 硬件接口类型（在此定义）的关节，以下列组合作为命令接口受支持：

- `position`
- `position`, `velocity`
- `position`, `velocity`, `acceleration`
- `velocity`
- `effort`
- `position`, `effort`

这意味着关节可以有一个或多个命令接口，同时应用以下控制律：

- 对于 `position` 命令接口，期望位置被直接转发给关节；
- 对于 `acceleration` 命令接口，期望加速度被直接转发给关节；
- 对于 `velocity` 命令接口，如果配置了 PID 回路（参数详情），则位置+速度轨迹跟随误差通过 PID 回路映射为 `velocity` 命令；
- 对于 `effort` 命令接口（没有 `position` 命令接口），如果配置了 PID 回路（参数详情），则位置+速度轨迹跟随误差通过 PID 回路映射为 `effort` 命令。此外，它还会将轨迹的力作为前馈力（feedforward effort）加到 PID 输出上；
- 对于 `position, effort` 命令接口，不使用 PID 回路。如果轨迹包含力，其值将直接传递给 `effort` 接口，而期望位置将转发给 `position` 接口。这对于需要额外力来维持接触的操作任务（manipulation tasks）可能很有用。

这导致了以下命令接口与状态接口的允许组合：

- 对于 `position` 命令接口，状态接口没有限制；
- 对于 `velocity` 命令接口：
  - 如果 `velocity` 是唯一的命令接口，则状态接口必须包含 `position, velocity`；
- 对于 `effort` 或 `position, effort` 命令接口，状态接口必须包含 `position, velocity`；
- 对于 `acceleration` 命令接口，状态接口必须包含 `position, velocity`。

还存在进一步的状态接口限制：

- 如果缺少 `position` 接口，则不能使用 `velocity` 状态接口；
- 如果 `position` 和 `velocity` 接口不存在，则不能使用 `acceleration` 状态接口。

示例控制器配置可在下文找到。

### 4.6.2 其他特性

- 实时安全实现；
- 正确处理缠绕（连续）关节（wrapping/continuous joints）；
- 对系统时钟变化稳健：不连续的系统时钟变化不会导致已排队轨迹段的执行出现不连续；
- 取消时可选的平滑减速：控制器不是突然保持位置，而是可以使用可配置的逐关节减速度限制来让关节减速到停止。参见《取消时减速》（Decelerate on cancel）。

### 4.6.3 使用关节轨迹控制器

控制器期望至少来自硬件的 position 反馈。关节速度和加速度是可选的。目前控制器不会内部从加速度积分出速度、从速度积分出位置。因此，如果硬件只提供加速度或速度状态，则必须在 hardware-interface 实现的 velocity 和 position 中完成积分才能使用这些控制器。

本包中实现了关节轨迹控制器的通用版本。使用它的 yaml 文件可以是：

```yaml
controller_manager:
  ros__parameters:
    joint_trajectory_controller:
      type: "joint_trajectory_controller/JointTrajectoryController"

joint_trajectory_controller:
  ros__parameters:
    joints:
      - joint1
      - joint2
      - joint3
      - joint4
      - joint5
      - joint6

    command_interfaces:
      - position

    state_interfaces:
      - position
      - velocity

    action_monitor_rate: 20.0

    allow_partial_joints_goal: false
    interpolate_from_desired_state: true
    constraints:
      stopped_velocity_tolerance: 0.01
      goal_time: 0.0
      joint1:
        trajectory: 0.05
        goal: 0.03
```

#### 抢占策略（Preemption policy）[1]

任何时刻只能有一个动作目标处于活动状态，或者在使用话题接口时没有目标。路径和目标的容差只针对活动目标对应的轨迹段进行检查。

当活动动作目标被来自动作接口的另一个命令抢占时，该目标被中止并通知客户端。轨迹以明确的方式被替换，参见《轨迹替换》（trajectory replacement）。

从话题接口（而非动作接口）发送空轨迹消息将覆盖当前动作目标，但不会中止该动作。

#### 控制器接口说明

**参考接口（References）**

（该控制器尚未实现为链式控制器）

**状态接口（States）**

状态接口由 `joints` 和 `state_interfaces` 参数定义，格式为：`<joint>/<state_interface>`。

状态接口的合法组合见《硬件接口类型》一节。

**命令接口（Commands）**

向控制器发送轨迹有两种机制：

- 通过动作（action），参见《动作》；
- 通过话题（topic），参见《订阅者》。

两者都使用 `trajectory_msgs/msg/JointTrajectory` 消息来指定轨迹，并且如果 `allow_partial_joints_goal` 未设置为 `True`，都要求为控制器的所有关节（而不是仅一部分关节）指定值。有关消息格式的更多信息，请参见《轨迹表示》（trajectory representation）。

**动作（Actions）[1]**

**`<controller_name>/follow_joint_trajectory`** `[control_msgs::action::FollowJointTrajectory]`

用于命令控制器的动作服务器。

发送轨迹的主要方式是通过动作接口，当需要执行监控时，应优先使用这种方式。

动作目标不仅允许指定要执行的轨迹，还允许（可选）指定路径和目标容差。详情请参见 JointTolerance 消息：

> 容差指定位置、速度和加速度可以偏离设定值的程度。例如，在轨迹控制的情况下，当实际位置偏离超出（期望位置 + 位置容差）时，轨迹目标可能会中止。
>
> 容差有两个特殊值：
> - 0 —— 容差未指定，将保持为默认值；
> - -1 —— 容差被"擦除"。如果存在默认值，关节将被允许无限制地移动。

当未指定容差时，使用参数接口中给出的默认值（参见《参数详情》）。如果在轨迹执行期间违反容差，动作目标被中止，通知客户端，并保持当前位置。

在目标于指定容差内达到后，动作服务器向客户端返回成功，并继续执行最后一个命令点。

**订阅者（Subscriber）[1]**

**`<controller_name>/joint_trajectory`** `[trajectory_msgs::msg::JointTrajectory]`

用于命令控制器的话题。

话题接口是一种即发即弃（fire-and-forget）的替代方案。如果您不关心执行监控，请使用此接口。在这种情况下不使用目标容差规范，因为没有机制通知发送方容差违规。如果违反状态容差，轨迹被中止并保持当前位置。请注意，虽然可以通过 `~/query_state` 服务和 `~/controller_state` 话题获得某种程度的监控，但实现起来比动作接口麻烦得多。

**发布者（Publishers）**

**`<controller_name>/controller_state`** `[control_msgs::msg::JointTrajectoryControllerState]`

以 controller manager 的更新速率发布内部状态的话题。

**服务（Services）**

**`<controller_name>/query_state`** `[control_msgs::srv::QueryTrajectoryState]`

查询任意未来时间的控制器状态。

### 4.6.4 进一步信息

- 轨迹表示（Trajectory Representation）
- 轨迹替换（Trajectory Replacement）
- 取消时减速（Decelerate on cancel）
- 速度缩放（Speed scaling）
- joint_trajectory_controller 参数
- rqt_joint_trajectory_controller

---

### 4.6.5 轨迹表示（Trajectory Representation）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/trajectory.html>

轨迹在内部用 `trajectory_msgs/msg/JointTrajectory` 数据结构表示。

目前实现了两种插值方法：`none` 和 `spline`。默认提供一个样条插值器，但也可以支持其他表示。

> **警告**
>
> 用户必须确保为轨迹提供正确的输入，这是控制器的命令接口设置和 PID 配置所需要的。没有健全性检查，采样轨迹中缺失字段可能会导致段错误（segmentation faults）。

#### 插值方法 `none`

它返回初始点，直到到达第一个轨迹数据点的时间。然后，它简单地取下一个给定的数据点。

> **警告**
>
> 它不从导数推导（积分）轨迹，也不计算导数。即，必须按需提供位置及其导数。

#### 插值方法 `spline`

样条插值器根据航点规范使用以下插值策略：

- 线性（Linear）：
  - 仅指定位置时使用；
  - 返回位置和速度；
  - 保证位置级别的连续性；
  - 不推荐，因为它会产生在航点处速度不连续的轨迹。
- 三次（Cubic）：
  - 指定位置和速度时使用；
  - 返回位置、速度和加速度；
  - 保证速度级别的连续性。
- 五次（Quintic）：
  - 指定位置、速度和加速度时使用；
  - 返回位置、速度和加速度；
  - 保证加速度级别的连续性。

如果 `allow_integration_in_goal_trajectories` 为 true，则可以处理并接受仅包含速度字段、仅包含速度和加速度字段、或仅包含加速度字段的轨迹。此时位置（和速度）通过 Heun 方法从速度（或加速度）积分得到。

对于声明了 `effort` 命令接口的控制器，允许使用力轨迹（effort trajectories），它们被视为加到位置反馈上的前馈力（feed-forward effort）。力与位置、速度和加速度分开处理。当选择 `spline` 插值方法时，我们对力使用线性插值。

#### 可视化示例

为了可视化不同插值方法及其输入的差异，在 0.5 秒网格上定义不同的轨迹，并以 10ms 的速率采样。

- 仅给定位置时，采用线性样条采样的轨迹；
![仅位置采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position.png)

- 仅给定速度时，采用三次样条采样的轨迹（对于 `none` 插值方法没有推导）；
![仅速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_velocity.png)

- 给定位置和速度时采样的轨迹；
![位置+速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity.png)


> **注意**
>
> 如果使用相同的积分方法（`Trajectory` 类使用 Heun 方法），则 `spline` 方法的结果与上面仅给定速度作为输入时相同。

- 仅给定加速度时，采用五次样条采样的轨迹（对于 `none` 插值方法没有推导）；
![仅加速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_acceleration.png)

- 给定位置、速度和加速度点时采样的轨迹；
![位置+速度+加速度采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration.png)


> **注意**
>
> 如果使用相同的积分方法（`Trajectory` 类使用 Heun 方法），则 `spline` 方法的结果与上面仅给定加速度作为输入时相同。

- 给定与上面相同的位置、速度和加速度点，但具有非零初始点时采样的轨迹；
![位置+速度+加速度，非零初始点采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration_initialpoint.png)

- 给定与上面相同的位置、速度和加速度点，但第一个点在 `t=0` 开始时采样的轨迹；
![位置+速度+加速度，首点 t=0 采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_position_velocity_acceleration_initialpoint_notime.png)


> **注意**
>
> 如果第一个点从 `t=0` 开始，则没有从初始点到轨迹的插值。

- 给定不一致的位置、速度和加速度点时，采用样条采样的轨迹；
![不一致的位置/速度/加速度点采样轨迹](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/trajectory/spline_wrong_points.png)


> **注意**
>
> 插值方法 `none` 只给出下一个输入点，而 `spline` 插值方法显示出高过冲（overshoot）以匹配给定的轨迹点。

### 4.6.6 轨迹替换（Trajectory Replacement）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/trajectory.html>

关节轨迹消息允许通过 header 时间戳指定新轨迹开始执行的时间，其中零时间（默认）表示"立即开始"。

当前实现只是丢弃旧轨迹。关注此 issue 以获取更多信息。

---

### 4.6.7 取消时减速（Decelerate on cancel）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/decelerate_on_cancel.html>

默认情况下，当轨迹被取消或抢占时，控制器会立即保持当前位置。这对于高速移动的硬件可能造成问题，因为突然停止可能触发故障或造成过度磨损。

当启用 `decelerate_on_cancel` 功能时，控制器会生成一条平滑的停止轨迹，使用恒定减速度曲线将每个关节减速到零速度，然后保持位置。

_默认行为：当轨迹被取消时，控制器立即将命令位置设置为当前位置，导致突然停止。_
![默认行为：取消时立即保持位置](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/decelerate_on_cancel/decelerate_hold_position.png)


_启用 decelerate on cancel：控制器生成一条斜坡停止轨迹，在保持位置前平滑地使每个关节减速。_
![启用 decelerate on cancel：平滑减速停止](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/decelerate_on_cancel/decelerate_to_stop.png)


#### 工作原理

当轨迹被取消或抢占且启用了 `decelerate_on_cancel` 时，控制器：

1. 从速度状态接口读取每个关节的当前速度。
2. 使用每个关节配置的 `max_deceleration_on_cancel` 值计算停止距离和停止时间：

$$
t_{stop} = \frac{|v|}{a_{max}}
$$

$$
d_{stop} = \frac{v \cdot t_{stop}}{2}
$$

其中 $v$ 是当前速度，$a_{max}$ 是配置的最大减速度。

3. 生成一条轨迹，其中包含在计算的停止时间内将速度线性斜坡降到零的中间航点。
4. 在计算的停止位置追加最终的保持位置点。

每个关节根据其自身的 `max_deceleration_on_cancel` 值独立减速，但轨迹是同步的，因此所有关节在同一时间（最慢关节的停止时间）完成。

#### 要求

- 硬件必须为控制器中的所有关节提供 `velocity` 状态接口。如果速度状态反馈不可用，控制器会回退到默认的保持位置行为。
- 每个关节必须有一个有效（大于零）的 `max_deceleration_on_cancel` 值。值为 `0.0` 的关节会导致控制器回退到保持位置行为。

#### 配置

通过设置 `constraints.decelerate_on_cancel` 为 `true`，并在 `constraints.<joint_name>` 下为每个关节提供 `max_deceleration_on_cancel` 值（单位 rad/s^2 或 m/s^2）来启用该功能：

```yaml
controller_name:
  ros__parameters:
    joints:
      - joint_1
      - joint_2
      - joint_3

    constraints:
      decelerate_on_cancel: true
      stopped_velocity_tolerance: 0.01
      goal_time: 0.0
      joint_1:
        max_deceleration_on_cancel: 10.0
      joint_2:
        max_deceleration_on_cancel: 3.0
      joint_3:
        max_deceleration_on_cancel: 6.0
```

> **注意**
>
> `decelerate_on_cancel` 和 `max_deceleration_on_cancel` 都是只读参数。它们只能在控制器配置时设置，不能在运行时更改。

> **注意**
>
> 选择在硬件物理极限范围内的 `max_deceleration_on_cancel` 值。过高的值仍可能导致故障，而过低的值会导致更长的停止距离。

---

### 4.6.8 速度缩放（Speed scaling）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/speed_scaling.html>

`joint_trajectory_controller`（JTC）支持动态缩放其轨迹执行速度。这意味着，当指定小于 1 的缩放因子 $f$ 时，每个控制周期只前进 $f \cdot \Delta_t$，其中 $\\Delta_t$ 是控制器的周期时间。

#### 速度缩放的方法

一般来说，速度缩放功能设想了两种不同的缩放方法：机载缩放（On-Robot scaling）和控制器侧缩放（On-Controller scaling）。它们在概念上不同，要正确配置速度缩放，理解其差异很重要。

**机载速度缩放（On-Robot speed scaling）**

此缩放方法适用于直接在机器人示教器（teach pendant）上和/或通过安全功能提供缩放功能的机器人。此类机器人的一个例子是 Universal Robots 机械臂。

硬件接口需要通过状态接口报告速度缩放，以便控制器可以读取。可选地，可以提供一个命令接口（如果适用）来在硬件上设置速度缩放值，从而通过 ROS 话题设置速度缩放。

就本文档而言，用户定义的缩放和安全限制的缩放被视为相同，统称为"硬件缩放因子"。

在这种设置下，硬件将处理从 ROS 控制器发送的命令（例如"在 $\\Delta_t$ 秒内到达关节配置 $\\theta$"）。这实际上意味着，当给定缩放因子 0.5 时，机器人只走一半的路程到达目标配置（忽略此期间的加速度和减速度影响）。

下图显示了在硬件缩放执行下、且控制器**不**感知速度缩放时的轨迹执行（针对一个关节）：
![未感知速度缩放时的轨迹执行](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/speed_scaling/traj_without_speed_scaling.png)


图中显示一个关节被移动到目标点再返回起点的轨迹。由于关节速度在示教器上被限制在非常低的设置，速度缩放（黑线）被激活并限制关节速度（绿线）。结果，目标轨迹（浅蓝色）没有被机器人执行，而是执行了粉红色轨迹。浅蓝色线和粉红色线之间的垂直距离是每个控制周期内的路径误差。我们可以看到，路径偏差在某个时刻超过 300 度，且 -6 弧度的目标点从未到达。

使用缩放版本的轨迹控制器后，前图所示的示例运动变成：
![启用速度缩放后的轨迹执行](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/speed_scaling/traj_with_speed_scaling.png)


ROS 侧的轨迹插值与实际机器人执行之间的偏差保持最小，机器人到达中间设定点，而不是像上面的例子那样"过早"返回。

缩放的完成方式是：轨迹中的时间被虚拟地缩放。例如，如果控制器以 100 Hz 的周期运行，每个控制周期为 10 ms。速度缩放 0.5 意味着每个时间步轨迹前进 5 ms 而不是 10 ms。因此，第 3 个时间步的开始在轨迹中是 15 ms 而不是 30 ms。

命令采样与未缩放时一样，使用时间步的开始加上**完整**的 10 ms 周期时间。机器人会将运动命令缩小 50%，导致只执行一半的距离，这就是为什么下一个控制周期将在当前开始位置加上半步时间处开始。

**控制器侧速度缩放（On-Controller speed scaling）**

从概念上讲，使用这种缩放时，机器人硬件不感知任何缩放的发生。JTC 生成发送给机器人的命令时已经相应缩小，因此可以直接由机器人执行。

由于硬件不感知速度缩放，因此不应指定与速度缩放相关的命令和状态接口，缩放因子将通过 `~/speed_scaling_input` 话题直接设置：

```
$ ros2 topic pub --qos-durability transient_local --once \
  /joint_trajectory_controller/speed_scaling_input control_msgs/msg/SpeedScalingFactor "{factor: 0.5}"
```

> **注意**
>
> `~/speed_scaling_input` 话题使用 QoS 持久性配置 `transient_local`。这意味着您可以在该话题上仍有一个发布者时重启控制器。

> **注意**
>
> 当前实现仅适用于基于位置的接口。

#### 对容差的影响

在执行轨迹时使用速度缩放，配置的执行容差也会被缩放。

由于命令是从缩放后的轨迹时间生成的，**路径误差**也将与缩放后的轨迹进行比较。

**目标时间容差**也使用虚拟轨迹时间。这意味着以恒定缩放因子 0.5 执行的轨迹，其执行时间将是最后一个轨迹点的 `time_from_start` 值所指定时间的两倍。只要机器人不超过这个时间，就认为满足目标时间容差。

如果应用程序依赖 `time_from_start` 字段中设置的实际执行时间，则必须在轨迹执行动作外面包裹一个外部监控。

---

### 4.6.9 参数详情（Details about parameters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_trajectory_controller/doc/parameters.html>

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`joints`** (string_array)

系统的关节名称。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0

**`command_joints`** (string_array)

要控制的关节名称。如果留空，将使用 `joints`。此参数可用于以下情况：

- JTC 在控制器链中使用，其中命令接口和状态接口名称不同；
- 命令关节的数量小于自由度。例如跟踪被动关节的状态和误差。此时 `command_joints` 必须是 `joints` 的子集。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

**`command_interfaces`** (string_array)

硬件接口为所有关节提供的命令接口。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0；每个元素是列表 [‘position’, ‘velocity’, ‘acceleration’, ‘effort’] 之一；自定义校验器：`joint_trajectory_controller::command_interface_type_combinations`

**`state_interfaces`** (string_array)

硬件为所有关节提供的状态接口。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；长度大于 0；每个元素是列表 [‘position’, ‘velocity’, ‘acceleration’] 之一；自定义校验器：`joint_trajectory_controller::state_interface_type_combinations`

**`speed_scaling.initial_scaling_factor`** (double)

如果与硬件没有交换，缩放因子的初始值。

- 只读：True
- 默认值：1.0
- 约束：大于或等于 0.0

**`speed_scaling.state_interface`** (string)

速度缩放状态接口的全限定名称。

- 只读：True
- 默认值：""

**`speed_scaling.command_interface`** (string)

用于在硬件上设置速度缩放因子的命令接口名称。

- 只读：True
- 默认值：""

**`allow_partial_joints_goal`** (bool)

允许关节目标只定义部分关节的轨迹。

- 默认值：false

**`open_loop_control`** (bool)

已弃用（deprecated）：改用 `interpolate_from_desired_state` 并将反馈增益设为零。

- 只读：True
- 默认值：false

**`interpolate_from_desired_state`** (bool)

在接收到新轨迹时，从当前期望状态开始插值。

控制器忽略硬件接口提供的状态，而是使用最后命令作为状态来开始轨迹插值。

如果硬件状态不跟随命令（即两者之间存在偏移，典型于液压机械臂），这将非常有用。此外，当您有一段通过多条消息发送的参考轨迹时（例如 MPC 风格的轨迹规划），这也是必需的。

如果设置了此标志，控制器在激活时会尝试从命令接口读取值。如果它们具有真实的数值，将使用这些值而不是状态接口。因此，在硬件启动时，将命令接口设置为 NaN（即 `std::numeric_limits<double>::quiet_NaN()`）或状态值非常重要。

- 只读：True
- 默认值：false

**`allow_integration_in_goal_trajectories`** (bool)

允许在目标轨迹中进行积分，以接受未指定位置或速度的目标。

- 默认值：false

**`set_last_command_interface_value_as_state_on_activation`** (bool)

当设置为 true 时，激活时将最后的命令接口值同时用作当前状态和最后命令状态。如果某个接口（例如 velocity）只能作为状态而不能作为命令，则使用状态。当使用柔性或顺应性（soft/compliant）硬件时，使用此设置可防止激活时的下垂/跳动（sagging/jumps）。当设置为 false 时，两者都使用当前状态。

- 默认值：true

**`action_monitor_rate`** (double)

当控制器执行动作（`control_msgs::action::FollowJointTrajectory`）时，监控状态变化的速率。

- 只读：True
- 默认值：20.0
- 约束：大于或等于 0.1

**`interpolation_method`** (string)

要使用的插值类型（如果有）。

- 只读：True
- 默认值："splines"
- 约束：指定值之一：[‘splines’, ‘none’]

**`allow_nonzero_velocity_at_trajectory_end`** (bool)

如果为 false，最后一个速度点必须为零，否则目标将被拒绝。

- 默认值：false

**`cmd_timeout`** (double)

超过后输入命令被视为过期的超时时间。超时从轨迹结束（最后一个点）开始计算。`cmd_timeout` 必须大于 `constraints.goal_time`，否则被忽略。如果为零，则超时被禁用。

- 默认值：0.0

**`constraints`**

如果 `JointTrajectory` 消息中未设置显式值时的默认容差值。还包含 `decelerate_on_cancel` 选项和逐关节的 `max_deceleration_on_cancel` 值，用于平滑停止行为（参见《取消时减速》）。

**`constraints.stopped_velocity_tolerance`** (double)

轨迹结束时的速度容差，用于指示受控系统已停止。

- 默认值：0.01

**`constraints.goal_time`** (double)

在命令时间之前或之后达到轨迹目标的时间容差。如果设为零，控制器将等待潜在无限长的时间。

- 默认值：0.0
- 约束：大于或等于 0.0

**`constraints.decelerate_on_cancel`** (bool)

如果为 true 且每个关节的 max_deceleration_on_cancel 大于 0，则在请求被取消或违反目标约束时减速到停止。要求控制器中所有关节都有速度状态接口。

- 只读：True
- 默认值：false

**`constraints.<joints>.trajectory`** (double)

运动期间逐关节的轨迹偏移容差。

- 默认值：0.0

**`constraints.<joints>.goal`** (double)

目标位置处逐关节的轨迹偏移容差。

- 默认值：0.0

**`constraints.<joints>.max_deceleration_on_cancel`** (double)

逐关节的最大减速度，用于在请求被取消或抢占时计算停止位置。

- 只读：True
- 默认值：0.0
- 约束：大于或等于 0.0

**`gains`**

这些参数用于为 `velocity` 或仅 `effort` 命令接口配置 PID 回路。该结构包含每个关节的控制器增益，遵循以下控制律：

- 如果 `velocity` 是唯一的命令接口：

$$
u = k_{ff} v_d + k_p e + k_i \sum e dt + k_d (v_d - v)
$$

其中 $v_d$ 是期望速度，$v$ 是测量速度，$e$ 是位置误差（定义见下文），$dt$ 是控制器周期，$u$ 是 `velocity` 操纵变量（控制变量）。

- 如果 `effort` 是唯一的命令接口：

$$
u = k_{ff} v_d + \delta_d + k_p e + k_i \sum e dt + k_d (v_d - v)
$$

其中 $v_d$ 是期望速度，$\\delta_d$ 是轨迹中提供的期望力（否则为 0），$v$ 是测量速度，$e$ 是位置误差（定义见下文），$dt$ 是控制器周期，$u$ 是 `effort` 操纵变量（控制变量）。

如果关节是连续类型，位置误差 $e = normalize(s_d - s)$ 被归一化到 $-\\pi, \\pi$ 之间，即到目标位置的最短旋转就是期望运动。否则使用 $e = s_d - s$，其中 $s_d$ 是期望位置，$s$ 是来自状态接口的测量位置。

如果您想关闭 PID（开环控制），请将反馈增益设为零，并为前馈增益 $k_{ff}$ 设置适当的值。

**`gains.<joints>.p`** (double)

PID 的比例增益 $k_p$。

- 默认值：0.0

**`gains.<joints>.i`** (double)

PID 的积分增益 $k_i$。

- 默认值：0.0

**`gains.<joints>.d`** (double)

PID 的微分增益 $k_d$。

- 默认值：0.0

**`gains.<joints>.i_clamp`** (double)

[已弃用，改用 i_clamp_max/i_clamp_min] 积分钳位。在正负两个方向对称。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.i_clamp_max`** (double)

积分上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.i_clamp_min`** (double)

积分下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<joints>.ff_velocity_scale`** (double)

速度的前馈缩放 $k_{ff}$。

- 默认值：0.0

**`gains.<joints>.u_clamp_max`** (double)

输出上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<joints>.u_clamp_min`** (double)

输出下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<joints>.antiwindup_strategy`** (string)

指定抗饱和（anti-windup）策略。选项：‘back_calculation’、‘conditional_integration’、‘legacy’ 或 ‘none’。注意 ‘back_calculation’ 策略使用 tracking_time_constant 参数来调节抗饱和行为。

- 只读：True
- 默认值："legacy"
- 约束：指定值之一：[‘back_calculation’, ‘conditional_integration’, ‘legacy’, ‘none’]

**`gains.<joints>.tracking_time_constant`** (double)

指定 ‘back_calculation’ 策略的跟踪时间常数。当选择此策略时，如果设为 0.0，将应用一个推荐的默认值。

- 默认值：0.0

**`gains.<joints>.error_deadband`** (double)

用于在误差处于给定范围内时停止积分。

- 默认值：0.0

#### 示例参数文件

```yaml
joint_trajectory_controller:
  ros__parameters:
    action_monitor_rate: 20.0
    allow_integration_in_goal_trajectories: false
    allow_nonzero_velocity_at_trajectory_end: false
    allow_partial_joints_goal: false
    cmd_timeout: 0.0
    command_interfaces: '{}'
    command_joints: '{}'
    constraints:
      <joints>:
        goal: 0.0
        max_deceleration_on_cancel: 0.0
        trajectory: 0.0
      decelerate_on_cancel: false
      goal_time: 0.0
      stopped_velocity_tolerance: 0.01
    gains:
      <joints>:
        antiwindup_strategy: legacy
        d: 0.0
        error_deadband: 0.0
        ff_velocity_scale: 0.0
        i: 0.0
        i_clamp: std::numeric_limits<double>::infinity()
        i_clamp_max: std::numeric_limits<double>::infinity()
        i_clamp_min: -std::numeric_limits<double>::infinity()
        p: 0.0
        tracking_time_constant: 0.0
        u_clamp_max: std::numeric_limits<double>::infinity()
        u_clamp_min: -std::numeric_limits<double>::infinity()
    interpolate_from_desired_state: false
    interpolation_method: splines
    joints: '{}'
    open_loop_control: false
    set_last_command_interface_value_as_state_on_activation: true
    speed_scaling:
      command_interface: ''
      initial_scaling_factor: 1.0
      state_interface: ''
    state_interfaces: '{}'
```

---

### 4.6.10 rqt_joint_trajectory_controller

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/rqt_joint_trajectory_controller/doc/userdoc.html>

rqt_joint_trajectory_controller 提供了一种直观的图形化方式来测试不同的关节位置和轨迹，而无需手动构造复杂的轨迹消息或使用命令行接口。
![rqt_joint_trajectory_controller 界面](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/joint_trajectory_controller/rqt/rqt_joint_trajectory_controller.png)


该界面允许您：

- 从下拉菜单中选择 controller manager 命名空间和控制器；
- 使用交互式滑块调整关节（joint1 和 joint2）的目标位置；
- 通过精确的数值输入微调关节位置；
- 使用速度缩放滑块控制运动速度；
- 使用中央电源按钮激活轨迹执行；
- 实时可视化当前关节配置。


## 4.7 运动原语控制器（Motion Primitives Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/motion_primitives_controllers/doc/userdoc.html>

用于使用运动原语（motion primitives）控制机器人的包，例如 LINEAR_JOINT（PTP/MOVEJ）、LINEAR_CARTESIAN（LIN/MOVEL）和 CIRCULAR_CARTESIAN（CIRC/MOVEC）。

> **警告**
>
> 无法保证运动原语定义的运动会被精确地按计划执行。特别是对于笛卡尔空间中的运动，如 LIN 原语，不保证机器人会以那种方式精确执行运动，因为逆运动学并不总是唯一的。

### 4.7.1 命令接口和状态接口

控制器使用以下命令和状态接口来传输运动原语。所有接口都使用命名方案 `tf_prefix_ + "motion_primitive/<interface name>"`，其中 `tf_prefix` 作为参数提供给控制器。

#### 命令接口

这些接口用于向硬件接口发送运动原语数据：

- `motion_type`：运动原语的类型（LINEAR_JOINT、LINEAR_CARTESIAN、CIRCULAR_CARTESIAN）
- `q1` – `q6`：基于关节运动的关节目标位置
- `pos_x`、`pos_y`、`pos_z`：笛卡尔目标位置
- `pos_qx`、`pos_qy`、`pos_qz`、`pos_qw`：目标位姿的方向四元数
- `pos_via_x`、`pos_via_y`、`pos_via_z`：圆弧运动的中间路径点位置
- `pos_via_qx`、`pos_via_qy`、`pos_via_qz`、`pos_via_qw`：路径点的方向四元数
- `blend_radius`：平滑过渡的混合半径
- `velocity`：期望运动速度
- `acceleration`：期望运动加速度
- `move_time`：基于时间执行的（可选）持续时间（适用于 LINEAR_JOINT 和 LINEAR_CARTESIAN。如果 move_time > 0，则忽略 velocity 和 acceleration）

#### 状态接口

这些接口用于将硬件接口的内部状态传回给 `motion_primitives_forward_controller`。

- `execution_status`：指示原语的当前执行状态。可能的值为：
  - `IDLE`：没有正在进行的运动；
  - `EXECUTING`：正在执行一个原语；
  - `SUCCESS`：最后一个命令成功完成；
  - `ERROR`：执行过程中发生错误；
  - `STOPPING`：硬件接口已收到 `STOP_MOTION` 命令，但机器人尚未停止；
  - `STOPPED`：机器人已使用 `STOP_MOTION` 命令停止，在执行新命令之前必须使用 `RESET_STOP` 命令复位。
- `ready_for_new_primitive`：布尔标志，指示接口是否准备好接收新的运动原语

### 4.7.2 motion_primitives_forward_controller

该控制器使用 control_msgs 中的 `ExecuteMotionPrimitiveSequence.action` 动作，提供向工业机器人控制器发送运动原语的接口。控制器通过动作接口接收原语，并通过命令接口将其转发给特定机器人的硬件接口。目前，已实现 Universal Robots 和 KUKA Robots 的硬件接口。

- 支持的运动原语：
  - `LINEAR_JOINT`
  - `LINEAR_CARTESIAN`
  - `CIRCULAR_CARTESIAN`

如果通过动作向控制器传递多个运动原语，控制器会将它们作为序列转发给硬件接口。为此，它首先发送 `MOTION_SEQUENCE_START`，然后发送每个单独的原语，最后发送 `MOTION_SEQUENCE_END`。这两个标记之间的所有原语将作为单个、连续的序列执行。这允许原语之间无缝过渡（混合）。

动作接口还允许停止当前运动原语的执行。当收到停止请求时，控制器向硬件接口发送 `STOP_MOTION`，随后使机器人停止运动。一旦控制器收到机器人已停止的确认，它向硬件接口发送 `RESET_STOP`。之后，可以发送新命令。

例如，可以通过 Python 脚本完成此操作，如 `Universal_Robots_ROS2_Driver` 包中的 `example python script` 所示。

#### motion_primitives_forward_controller 的架构概览

- 使用 `Universal_Robots_ROS2_Driver`（运动原语模式）的 UR 机器人的架构；
- 使用 `kuka_eki_motion_primitives_hw_interface` 的 KUKA 机器人的架构。
![ExecuteMotionPrimitiveSequence 动作数据流](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/Moprim_Controller_ExecuteMotion_Action.drawio.png)
![UR 机器人运动原语架构](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/ros2_control_motion_primitives_ur.drawio.png)
![KUKA 机器人运动原语架构](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/ros2_control_motion_primitives_kuka.drawio.png)


#### 使用 UR10e 和 motion_primitives_forward_controller 的演示视频
![UR10e 演示视频](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/moprim_forward_controller_ur_demo_thumbnail.png)


#### 使用 KR3 和 motion_primitives_forward_controller 的演示视频
![KR3 演示视频](https://lux2026.oss-cn-hangzhou.aliyuncs.com/images/ros2_controllers/motion_primitives/moprim_forward_controller_kuka_demo_thumbnail.png)


### 4.7.3 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含此控制器使用的所有参数的说明。

**`tf_prefix`** (string)

所有接口都使用命名方案 tf_prefix_ + motion_primitive/<interface name>。

- 只读：True
- 默认值：""

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_motion_primitives_forward_controller:
  ros__parameters:
    tf_prefix: ""
```

---

## 4.8 平行夹爪动作控制器（Parallel Gripper Action Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/parallel_gripper_controller/doc/userdoc.html>

用于执行简单平行夹爪的 `ParallelGripperCommand` 动作的控制器。该控制器支持仅提供位置控制的夹爪，以及允许配置速度和力的夹爪。默认情况下，控制器只会声明 `{joint}/position` 接口用于控制。速度接口和力接口可以通过分别设置 `max_velocity_interface` 和 `max_effort_interface` 参数来选择性地声明。默认情况下，控制器会尝试声明 position 和 velocity 状态接口。可通过设置 `state_interfaces` 参数来配置声明的状态接口。

### 4.8.1 参数

该控制器使用 generate_parameter_library 来处理其参数。

**`action_monitor_rate`** (double)

Hz

- 只读：True
- 默认值：20.0
- 约束：大于或等于 0.1

**`joint`** (string)

- 只读：True
- 约束：参数非空

**`state_interfaces`** (string_array)

- 默认值：{"position", "velocity"}

**`goal_tolerance`** (double)

- 默认值：0.01
- 约束：大于或等于 0.0

**`allow_stalling`** (bool)

允许堵转（stalling）：当夹爪向目标移动时发生堵转，动作服务器将返回成功。

- 默认值：false

**`stall_velocity_threshold`** (double)

堵转速度阈值。

- 默认值：0.001

**`stall_timeout`** (double)

堵转超时。

- 默认值：1.0
- 约束：大于或等于 0.0

**`max_effort_interface`** (string)

控制器将声明指定的力接口，例如 `robotiq_85_left_knuckle_joint/max_effort_interface`。

- 默认值：""

**`max_effort`** (double)

用于抓取（grasping）的默认力（牛顿）。

- 默认值：10.0
- 约束：大于或等于 0.0

**`max_velocity_interface`** (string)

控制器将声明指定的速度接口，例如 `robotiq_85_left_knuckle_joint/max_velocity_interface`。

- 默认值：""

**`max_velocity`** (double)

用于抓取（grasping）的默认目标速度（米/秒）。

- 默认值：0.1
- 约束：大于或等于 0.0

---

## 4.9 PID 控制器（PID Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/pid_controller/doc/userdoc.html>

使用 control_toolbox 包中 PidROS 实现的 PID 控制器实现。该控制器可以通过话题直接发送参考值，也可以在链式结构中带前置或后置控制器使用。它还支持使用参考值的一阶导数及其反馈来实现二阶 PID 控制。

根据硬件的参考/状态和命令接口，应使用不同的 PidROS 参数设置，例如：

- 参考/状态 POSITION；命令 VELOCITY → PI 控制器
- 参考/状态 VELOCITY；命令 ACCELERATION → PI 控制器
- 参考/状态 VELOCITY；命令 POSITION → PD 控制器
- 参考/状态 ACCELERATION；命令 VELOCITY → PD 控制器
- 参考/状态 POSITION；命令 POSITION → PID 控制器
- 参考/状态 VELOCITY；命令 VELOCITY → PID 控制器
- 参考/状态 ACCELERATION；命令 ACCELERATION → PID 控制器
- 参考/状态 EFFORT；命令 EFFORT → PID 控制器

> **注意**
>
> 理论上，可以滥用关节轨迹控制器（JTC）来达到同样的目的，只需向它发送一个参考点。然而，不推荐这样做。如果您需要使用线性、三次或五次插值在轨迹点之间插值，则应使用 JTC。PID 控制器不做这些。JTC 的 PID 项有不同的用途——它使仅命令 `velocity` 或 `effort` 接口到硬件成为可能。

### 4.9.1 控制器的执行逻辑

控制器也可以以"前馈"（feed-forward）模式使用，其中前馈增益用于提高控制器的动态响应。如果使用一种参考和状态接口类型，则只使用即时误差。如果有两种，则第二种接口类型被视为第一种类型的一阶导数。例如，一个合法的组合是 `position` 和 `velocity` 接口类型。

### 4.9.2 使用控制器

- Pluginlib 库：pid_controller
- 插件名称：pid_controller/PidController

### 4.9.3 控制器接口说明

#### 参考接口（来自前置控制器）

- `<reference_and_state_dof_names[i]>/<reference_and_state_interfaces[j]>` `[double]` **注意**：`reference_and_state_dof_names[i]` 可以来自 `reference_and_state_dof_names` 参数，如果为空，则来自 `dof_names`。

#### 命令接口（Commands）

- `<dof_names[i]>/<command_interface>` `[double]`

#### 状态接口（States）

- `<reference_and_state_dof_names[i]>/<reference_and_state_interfaces[j]>` `[double]` **注意**：`reference_and_state_dof_names[i]` 可以来自 `reference_and_state_dof_names` 参数，如果为空，则来自 `dof_names`。

#### 订阅者

如果控制器不处于链式模式（`in_chained_mode == false`）：

- `<controller_name>/reference` `[control_msgs/msg/MultiDOFCommand]`

如果控制器参数 `use_external_measured_states` 为 true：

- `<controller_name>/measured_state` `[control_msgs/msg/MultiDOFCommand]`

#### 服务

- `<controller_name>/set_feedforward_control` `[std_srvs/srv/SetBool]`

> **警告**
>
> 该服务将被弃用，取而代之的是将 `feedforward_gain` 参数设置为非零值。

#### 发布者

- `<controller_name>/controller_state` `[control_msgs/msg/MultiDOFStateStamped]`
- `<controller_name>/<dof>/pid_state` `[control_msgs/msg/PidState]`

最初 PidState 发布者是关闭的。可以通过 `gains.<dof>.activate_state_publisher` 参数打开。

#### 参数

PID 控制器使用 generate_parameter_library 来处理其参数。

> **警告**
>
> 参数 `enable_feedforward` 将被弃用，取而代之的是将 `feedforward_gain` 参数设置为非零值。如果当前 `feedforward_gain` 设置为非零值但未激活，这将来可能导致不同的行为。

**`dof_names`** (string_array)

指定控制器使用的 dof_names 或轴。如果定义了 `reference_and_state_dof_names` 参数，则此参数只定义命令 dof 名称。

- 只读：True
- 默认值：{}
- 约束：不包含重复项；参数非空

**`reference_and_state_dof_names`** (string_array)

（可选）指定用于获取参考值和读取状态的 dof_names 或轴。该参数仅当状态 dof 名称与命令 dof 名称不同时（即使用后置控制器时）相关。

- 只读：True
- 默认值：{}
- 约束：不包含重复项

**`command_interface`** (string)

控制器用于向硬件写入命令的接口名称。

- 只读：True
- 默认值：""
- 约束：参数非空

**`reference_and_state_interfaces`** (string_array)

控制器用于获取硬件状态和参考命令的接口名称。第二个接口应是第一个接口的导数。

- 只读：True
- 默认值：{}
- 约束：参数非空；长度大于 0；长度小于 3

**`set_current_state_as_first_setpoint`** (bool)

为 true 时，控制器激活时将当前状态设置为第一个设定点。这有助于避免控制器启动时出现较大的初始误差和控制输出的突然跳变。

- 只读：True
- 默认值：true

**`use_external_measured_states`** (bool)

使用来自话题的外部状态，而不是来自状态接口。

- 默认值：false

**`enable_feedforward`** (bool)

启用前馈增益。（将弃用，取而代之的是将 feedforward_gain 设置为非零值。）

- 默认值：false

**`gains.<dof_names>.p`** (double)

PID 的比例增益。

- 默认值：0.0

**`gains.<dof_names>.i`** (double)

PID 的积分增益。

- 默认值：0.0

**`gains.<dof_names>.d`** (double)

PID 的微分增益。

- 默认值：0.0

**`gains.<dof_names>.u_clamp_max`** (double)

输出上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.u_clamp_min`** (double)

输出下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.antiwindup`** (bool)

[已弃用，见 antiwindup_strategy] 抗饱和功能。设置为 true 时，限制积分误差以防止饱和；否则，限制积分对控制输出的贡献。i_clamp_max 和 i_clamp_min 在两种情况下都会应用。

- 默认值：false

**`gains.<dof_names>.i_clamp_max`** (double)

[已弃用，见 antiwindup_strategy] 积分上限钳位。

- 默认值：`std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.i_clamp_min`** (double)

[已弃用，见 antiwindup_strategy] 积分下限钳位。

- 默认值：`-std::numeric_limits<double>::infinity()`

**`gains.<dof_names>.antiwindup_strategy`** (string)

指定抗饱和（anti-windup）策略。选项：‘back_calculation’、‘conditional_integration’、‘legacy’ 或 ‘none’。注意 ‘back_calculation’ 策略使用 tracking_time_constant 参数来调节抗饱和行为。

- 默认值："legacy"
- 约束：指定值之一：[‘back_calculation’, ‘conditional_integration’, ‘legacy’, ‘none’]

**`gains.<dof_names>.tracking_time_constant`** (double)

指定 ‘back_calculation’ 策略的跟踪时间常数。当选择此策略时，如果设为 0.0，将应用一个推荐的默认值。

- 默认值：0.0

**`gains.<dof_names>.error_deadband`** (double)

用于在误差处于给定范围内时停止积分。

- 默认值：1e-16

**`gains.<dof_names>.feedforward_gain`** (double)

前馈部分的增益。

- 默认值：0.0

**`gains.<dof_names>.angle_wraparound`** (bool)

用于会缠绕（即连续）的关节。将位置误差归一化到 -pi 到 pi 之间。

- 默认值：false

**`gains.<dof_names>.save_i_term`** (bool)

指示重新激活后是否保留积分项。

- 默认值：true

**`gains.<dof_names>.activate_state_publisher`** (bool)

每个 DOF 单独的状态发布器激活。如果为 true，控制器将每个 DOF 的状态发布到话题 `/<controller_name>/<dof_name>/pid_state`。

- 默认值：false

#### 示例参数文件

可在 test 文件夹（独立模式）中找到该控制器的示例参数文件：

```yaml
/**:
  ros__parameters:
# TODO(christohfroehlich): Remove this global parameters once the deprecated antiwindup parameters are removed.
    gains:
      joint1: {antiwindup_strategy: "none",}
      joint2: {antiwindup_strategy: "none",}

test_pid_controller:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, u_clamp_max: 5.0, u_clamp_min: -5.0}

test_pid_controller_unlimited:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0}

test_pid_controller_angle_wraparound_on:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, angle_wraparound: true}

test_pid_controller_with_feedforward_gain:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 0.5, i: 0.0, d: 0.0, feedforward_gain: 1.0}

test_pid_controller_with_feedforward_gain_dual_interface:
  ros__parameters:
    dof_names:
      - joint1
      - joint2

    command_interface: velocity

    reference_and_state_interfaces: ["position", "velocity"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 0.5, i: 0.3, d: 0.4, feedforward_gain: 1.0}
      joint2: {p: 0.5, i: 0.3, d: 0.4, feedforward_gain: 1.0}

test_save_i_term_off:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, save_i_term: false}

test_save_i_term_on:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: true

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, save_i_term: true}

test_pid_controller_no_first_setpoint:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    set_current_state_as_first_setpoint: false

    gains:
      joint1: {p: 1.0, i: 2.0, d: 3.0, u_clamp_max: 5.0, u_clamp_min: -5.0}
```

或作为前置控制器：

```yaml
test_pid_controller:
  ros__parameters:
    dof_names:
      - joint1

    command_interface: position

    reference_and_state_interfaces: ["position"]

    reference_and_state_dof_names:
      - joint1state

    gains:
      joint1: {antiwindup_strategy: "none"}
```

---

## 4.10 位置控制器（Position Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/position_controllers/doc/userdoc.html>

这是一组使用"position"关节命令接口工作的控制器集合，但可以在控制器层面接受不同的关节级命令，例如控制某个关节上的位置以实现设定的速度。

该包包含以下控制器：

### 4.10.1 position_controllers/JointGroupPositionController

这是 forward_command_controller 的一个特化实现，使用"position"关节接口工作。

#### 控制器的 ROS 2 接口

**话题**

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

关节的位置命令。

**参数**

该控制器覆盖了 forward_command_controller 的 interface 参数，并且 `joints` 参数是唯一必需的参数。

此处给出一个示例参数文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    position_controller:
      type: position_controllers/JointGroupPositionController

position_controller:
  ros__parameters:
    joints:
      - slider_to_cart
```

---

## 4.11 速度控制器（Velocity Controllers）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/velocity_controllers/doc/userdoc.html>

这是一组使用"velocity"关节命令接口工作的控制器集合，但可以在控制器层面接受不同的关节级命令，例如控制某个关节上的速度以实现设定的位置。

该包包含以下控制器：

### 4.11.1 velocity_controllers/JointGroupVelocityController

这是 forward_command_controller 的一个特化实现，使用"velocity"关节接口工作。

#### 控制器的 ROS 2 接口

**话题**

**`~/commands`**（输入话题）`[std_msgs::msg::Float64MultiArray]`

关节的速度命令。

**参数**

该控制器覆盖了 forward_command_controller 的 interface 参数，并且 `joints` 参数是唯一必需的参数。

此处给出一个示例参数文件：

```yaml
controller_manager:
  ros__parameters:
    update_rate: 100  # Hz

    velocity_controller:
      type: velocity_controllers/JointGroupVelocityController

velocity_controller:
  ros__parameters:
    joints:
      - slider_to_cart
```
