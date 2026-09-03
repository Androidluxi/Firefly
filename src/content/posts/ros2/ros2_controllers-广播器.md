---
title: "ros2_controllers 官方文档（五）：广播器 Broadcasters"
published: 2026-08-31
description: "ros2_controllers 广播器中文翻译：力/力矩传感器、扳手变换节点、IMU、关节状态、测距、位姿、GPS、状态接口、磁力计与电池状态广播器。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译", "ros2_controllers", "广播器"]
category: ROS2专题
slug: ros2-controllers-broadcasters
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 9
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「广播器（Broadcasters）」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

# 5. 广播器（Broadcasters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

广播器用于将硬件组件的传感器数据发布到 ROS 话题。在 ros2_control 的意义上，广播器仍然是使用与上述其他控制器相同控制器接口的控制器。

## 5.1 力/力矩传感器广播器（Force Torque Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/force_torque_sensor_broadcaster/doc/userdoc.html>

用于机器人或传感器的力/力矩状态接口消息的广播器。发布的消息类型是 `geometry_msgs/msg/WrenchStamped`。

广播器还支持使用滤波器链（filter chain）对力/力矩读数进行滤波，从而能够顺序应用多个滤波器。在这种情况下，会额外发布一个带有 `_filtered` 后缀的话题，包含最终结果。有关滤波器的更多详情，请参阅 filters 包仓库。关于如何配置具有任意数量滤波器的滤波器链，请参见参数部分。

该控制器是 `ForceTorqueSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.1.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

接口可以通过两种方式定义，使用 `sensor_name` 或 `interface_names` 参数：这两个参数不能同时定义。

滤波器链在 `sensor_filter_chain` 参数下配置为滤波器的顺序列表，其中每个滤波器由键 `filterN` 标识，`N` 表示其在链中的位置（例如 `filter1`、`filter2` 等）。每个滤波器条目必须指定插件的 `name` 和 `type`，以及该特定滤波器插件所需的任何附加参数。该链将在运行时使用 pluginlib 库加载每个滤波器，并传递指定的参数。

该链顺序处理数据，将一个滤波器的输出作为下一个滤波器的输入。

完整参数列表：

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`sensor_name`** (string)

在没有定义单独的接口名称时，用作接口前缀的传感器名称。如果使用，将使用 6D FTS 的标准接口名称：`<sensor_name>/force.x, ..., <sensor_name>/torque.z`。

- 默认值：""

**`interface_names`**

（可选）定义自定义的、逐轴的接口名称。当使用不同的前缀（即传感器名称）或非标准接口名称时使用。只需定义一个 `interface_name` 即可。这使广播器能够使用少于六个测量轴的力传感单元。示例定义：

```yaml
interface_names:
  force:
    x: example_name/example_interface
```

**`interface_names.force.x`** (string)

'x' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.force.y`** (string)

'y' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.force.z`** (string)

'z' 轴上具有力值的状态接口名称。

- 默认值：""

**`interface_names.torque.x`** (string)

绕 'x' 轴具有力矩值的状态接口名称。

- 默认值：""

**`interface_names.torque.y`** (string)

绕 'y' 轴具有力矩值的状态接口名称。

- 默认值：""

**`interface_names.torque.z`** (string)

绕 'z' 轴具有力矩值的状态接口名称。

- 默认值：""

**`offset.force.x`** (double)

'x' 轴力值的偏移量。

- 默认值：0.0

**`offset.force.y`** (double)

'y' 轴力值的偏移量。

- 默认值：0.0

**`offset.force.z`** (double)

'z' 轴力值的偏移量。

- 默认值：0.0

**`offset.torque.x`** (double)

绕 'x' 轴力矩值的偏移量。

- 默认值：0.0

**`offset.torque.y`** (double)

绕 'y' 轴力矩值的偏移量。

- 默认值：0.0

**`offset.torque.z`** (double)

绕 'z' 轴力矩值的偏移量。

- 默认值：0.0

**`multiplier.force.x`** (double)

'x' 轴力值的乘数。

- 默认值：1.0

**`multiplier.force.y`** (double)

'y' 轴力值的乘数。

- 默认值：1.0

**`multiplier.force.z`** (double)

'z' 轴力值的乘数。

- 默认值：1.0

**`multiplier.torque.x`** (double)

绕 'x' 轴力矩值的乘数。

- 默认值：1.0

**`multiplier.torque.y`** (double)

绕 'y' 轴力矩值的乘数。

- 默认值：1.0

**`multiplier.torque.z`** (double)

绕 'z' 轴力矩值的乘数。

- 默认值：1.0

**`sensor_filter_chain`**

定义滤波器链的参数映射，以 filterN 为键。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_force_torque_sensor_broadcaster:
  ros__parameters:
    frame_id:  "fts_sensor_frame"
test_force_torque_sensor_broadcaster_with_chain:
  ros__parameters:
    frame_id:  "fts_sensor_frame"
    sensor_name: "fts_sensor"
    sensor_filter_chain:
      filter1:
        name: dummy
        type: filters/IncrementFilterWrench
```

## 5.2 力/力矩变换节点（Wrench Transformer Node）

该包提供了一个独立的 ROS 2 节点 `wrench_transformer_node`，使用 TF2 将 `ForceTorqueSensorBroadcaster` 控制器发布的力/力矩消息变换到不同的目标帧。当应用程序需要传感器帧之外的其他坐标系中的力/力矩数据时，这很有用。

该节点订阅来自广播器的力/力矩消息（原始或滤波），并为每个目标帧发布到单独的话题。

#### 用法

可以通过直接将目标帧作为位置参数传递来启动力/力矩变换器：

```
ros2 run force_torque_sensor_broadcaster wrench_transformer_node frame1 frame2
```

目标帧也可以通过 `target_frames` 参数设置：

```
ros2 run force_torque_sensor_broadcaster wrench_transformer_node \
  --ros-args -p target_frames:="['frame1','frame2']"
```

当同时提供两者时，位置参数覆盖参数值。

#### 力/力矩变换器参数

力/力矩变换器使用 generate_parameter_library 来处理其参数。力/力矩变换器的参数定义文件包含所有参数的说明。

**`target_frames`** (string_array)

要将输入力/力矩变换到的目标帧名称数组。对于每个帧，将发布一个单独的输出话题。

- 默认值：{}
- 约束：参数非空

**`tf_timeout`** (double)

在帧之间变换力/力矩时 TF 查找的超时时间（秒）。

- 默认值：0.1

#### 话题

节点订阅：

- `~/wrench`（原始力/力矩消息）。要订阅滤波后的力/力矩消息，请使用话题重映射：`ros2 run ... --ros-args -r ~/wrench:=<namespace>/wrench_filtered`

节点发布：

- 对于 `target_frames` 中指定的每个目标帧，发布 `<namespace>/<target_frame>/wrench`：
  - 如果节点在根命名空间（`/`）中，命名空间默认为节点名称（例如 `/fts_wrench_transformer/<target_frame>/wrench`）；
  - 如果输入话题被重映射到滤波话题（名称中包含 "filtered"），输出话题会自动追加 `_filtered` 后缀（例如 `<namespace>/<target_frame>/wrench_filtered`）；
  - 这允许用户区分变换后的原始力/力矩数据和变换后的滤波力/力矩数据。

---

## 5.3 IMU 传感器广播器（IMU Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/imu_sensor_broadcaster/doc/userdoc.html>

来自 IMU 传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/Imu`。

该控制器是 `IMUSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.3.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/orientation.x, ..., <sensor_name>/angular_velocity.x, ..., <sensor_name>/linear_acceleration.x`。

- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`static_covariance_orientation`** (double_array)

静态方向协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`static_covariance_angular_velocity`** (double_array)

静态角速度协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`static_covariance_linear_acceleration`** (double_array)

静态线加速度协方差。关于 x、y、z 轴按行主序排列。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_imu_sensor_broadcaster:
  ros__parameters:

    sensor_name: "imu_sensor"
    frame_id:  "imu_sensor_frame"
```

---

## 5.4 关节状态广播器（Joint State Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/joint_state_broadcaster/doc/userdoc.html>

该广播器读取所有状态接口，并在 `/joint_states` 和 `/dynamic_joint_states` 上报告它们。

### 5.4.1 命令

广播器不是真正的控制器，因此不接受命令。

### 5.4.2 硬件接口类型

默认情况下，除非另有配置，否则使用所有可用的 _关节状态接口_。在后一种情况下，结果接口由 `joints` 和 `interfaces` 参数的叉积定义的接口"矩阵"来确定。如果某些请求的接口缺失，控制器会打印有关此问题的警告，但会为其他接口工作。如果请求的接口都没有定义，控制器在激活时返回错误。

### 5.4.3 发布的话题

- `/joint_states`（`sensor_msgs/msg/JointState`）：
  仅为提供这些接口的关节发布 _与运动相关_ 的接口——`position`、`velocity` 和 `effort`。如果关节没有暴露某个运动接口，该字段在该关节的消息中被省略/留空。

- `/dynamic_joint_states`（`control_msgs/msg/DynamicJointState`）：
  为每个关节发布 **所有可用的状态接口**。这包括运动接口（position/velocity/effort）_以及_ 硬件提供的任何附加或自定义接口（例如温度、电压、力矩传感器读数、校准标志）。

该消息将 `joint_names` 映射到逐关节的接口名称列表和值。示例负载：

```
joint_names: [joint1, joint2]
interface_values:
  - interface_names: [position, velocity, effort]
    values: [1.5708, 0.0, 0.20]
  - interface_names: [position, temperature]
    values: [0.7854, 42.1]
```

如果您需要 _每一个_ 报告的接口（而不仅仅是运动相关的），请使用此话题。

> **注意**
>
> 如果 `use_local_topics` 设为 `true`，两个话题都在控制器的命名空间中发布（例如 `/my_state_broadcaster/joint_states` 和 `/my_state_broadcaster/dynamic_joint_states`）。如果为 `false`（默认），则在根命名空间发布（例如 `/joint_states`）。

### 5.4.4 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`use_local_topics`** (bool)

定义是否将 `joint_states` 和 `dynamic_joint_states` 消息发布到本地命名空间，例如 `/my_state_broadcaster/joint_states`。

- 只读：True
- 默认值：false

**`joints`** (string_array)

支持仅广播特定关节和接口的参数。必须与 `interfaces` 参数结合使用。如果 `joints` 或 `interfaces` 任一为空，将发布所有可用的状态接口。关节状态广播器请求访问所有已定义关节的所有已定义接口。

- 只读：True
- 默认值：{}

**`extra_joints`** (string_array)

要添加到 `joint_states` 和 `dynamic_joint_states` 且状态设为 0 的额外关节名称。

- 只读：True
- 默认值：{}

**`interfaces`** (string_array)

支持仅广播特定关节和接口的参数。必须与 `joints` 参数结合使用。如果 `joints` 或 `interfaces` 任一为空，将发布所有可用的状态接口。如果此参数包含 `position`、`velocity` 或 `effort`，则相应的 `map_interface_to_joint_state.<field>` 设置将被忽略，因为标准接口已被直接请求。仅当这种被忽略的映射被设置为不同的自定义接口名称时，才会打印警告。

- 只读：True
- 默认值：{}

**`map_interface_to_joint_state`**

（可选）参数（映射），提供自定义接口名称到 `joint_states` 消息中标准字段的映射。使用场景：

1. 液压机器人，其反馈和命令值通常有偏移，并且常依赖开环控制。通常在框架中把两个值映射到单独的接口。为了在 RViz 中可视化这些数据，会使用多个 joint_state_broadcaster 实例和 robot_state_publishers 来同时显示两个值。
2. 机器人为其关节值提供多种测量技术，导致值略有不同。通常在框架中使用单独的接口来提供这些值。使用多个 joint_state_broadcaster 实例，我们可以在 RViz 中同时发布和显示两者。

格式（每行可选）：

```yaml
map_interface_to_joint_state:
    position: <custom_interface>
    velocity: <custom_interface>
    effort: <custom_interface>
```

如果 `interfaces` 显式包含 `position`、`velocity` 或 `effort`，则相应的 `map_interface_to_joint_state` 条目被忽略，因为标准接口已被直接请求。在这种错误配置中，仅当配置的映射值与标准接口名称不同时才打印警告。

示例：

```yaml
map_interface_to_joint_state:
    position: kf_estimated_position
```

```yaml
map_interface_to_joint_state:
    velocity: derived_velocity
    effort: derived_effort
```

```yaml
map_interface_to_joint_state:
    effort: torque_sensor
```

```yaml
map_interface_to_joint_state:
    effort: current_sensor
```

**`map_interface_to_joint_state.position`** (string)

- 只读：True
- 默认值："position"

**`map_interface_to_joint_state.velocity`** (string)

- 只读：True
- 默认值："velocity"

**`map_interface_to_joint_state.effort`** (string)

- 只读：True
- 默认值："effort"

**`use_urdf_to_filter`** (bool)

使用 robot_description 过滤 `joint_states` 话题。如果为 true，广播器将只发布 URDF 中存在的关节的数据。如果为 false，广播器将发布任何类型为 `position`、`velocity` 或 `effort` 的接口的数据。

- 只读：True
- 默认值：true

**`frame_id`** (string)

在发布的关节状态中使用的 frame_id。该参数允许 rviz2 可视化关节的力。

- 只读：True
- 默认值："base_link"

**`publish_dynamic_joint_states`** (bool)

是否发布动态关节状态。

- 只读：True
- 默认值：true

#### 示例参数文件

```yaml
joint_state_broadcaster:
  ros__parameters:
    extra_joints: '{}'
    frame_id: base_link
    interfaces: '{}'
    joints: '{}'
    map_interface_to_joint_state:
      effort: effort
      position: position
      velocity: velocity
    publish_dynamic_joint_states: true
    use_local_topics: false
    use_urdf_to_filter: true
```

### 5.4.5 消息中关节的顺序

消息中关节的顺序可以由 3 种不同的参数设置决定：

1. 未定义 `joints` 参数且 `use_urdf_to_filter` 设为 `false`：
   消息中关节的顺序与资源管理器（resource manager）中注册的关节状态接口的顺序相同。这通常是硬件组件被加载和配置的顺序。

2. 未定义 `joints` 参数且 `use_urdf_to_filter` 设为 `true`：
   消息中关节的顺序与 URDF 文件中关节的顺序相同，它继承自加载的 URDF 模型，与 ros2_control 标签中的顺序无关。

3. 定义了 `joints` 参数和 `interfaces` 参数：
   消息中关节的顺序与 `joints` 参数中关节的顺序相同。

如果 `joints` 参数是 URDF（或总可用状态接口）中关节的子集，则消息中只发布 `joints` 参数中的关节。

如果所定义的 `joints` 参数和 `interfaces` 参数的组合不在可用的状态接口中，控制器将无法激活。

> **注意**
>
> 如果设置了 `extra_joints` 参数，`extra_joints` 参数中的关节会追加到消息中关节名称的末尾。

---

## 5.5 测距传感器广播器（Range Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/range_sensor_broadcaster/doc/userdoc.html>

来自测距传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/Range`。

该控制器是 `RangeSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.5.1 参数

测距传感器广播器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

在没有定义单独的接口名称时，用作接口前缀的传感器名称。

- 默认值：""

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""

**`radiation_type`** (int)

传感器使用的辐射类型 / 0 = 超声波（Ultrason）/ 1 = 红外（Infrared）。

- 默认值：0

**`field_of_view`** (double)

距离读数有效的弧大小 [rad]。

- 默认值：0.52

**`min_range`** (double)

最小距离值 [m]。

- 默认值：0.52

**`max_range`** (double)

最大距离值 [m]。

- 默认值：4.0

**`variance`** (double)

距离值的方差。

- 默认值：0.0

#### 示例参数文件

```yaml
range_sensor_broadcaster:
  ros__parameters:
    field_of_view: 0.52
    frame_id: ''
    max_range: 4.0
    min_range: 0.52
    radiation_type: 0.0
    sensor_name: ''
    variance: 0.0
```

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_range_sensor_broadcaster:
  ros__parameters:
    # Setting mendatory parameters
    sensor_name: "range_sensor"
    frame_id: "range_sensor_frame"

    # Setting parameters with changed default value to check those are used
    radiation_type: 1
    field_of_view: 0.1
    min_range: 0.10
    max_range: 7.0
    variance: 1.0
```

---

## 5.6 位姿广播器（Pose Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/pose_broadcaster/doc/userdoc.html>

用于机器人或传感器测量的位姿的广播器。位姿以 `geometry_msgs/msg/PoseStamped` 消息发布，并可选地以 tf 变换发布。

该控制器是 `PoseSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.6.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`frame_id`** (string)

发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`pose_name`** (string)

用作控制器接口前缀的基本名称。状态接口名称是：`<pose_name>/position.x, ..., <pose_name>/position.z, <pose_name>/orientation.x, ..., <pose_name>/orientation.w`。

- 默认值：""
- 约束：参数非空

**`tf.enable`** (bool)

是否将位姿作为 tf 变换发布。

- 默认值：true

**`tf.child_frame_id`** (string)

发布的 tf 变换的子帧 id。如果留空，默认为 `pose_name`。

- 默认值：""

**`tf.publish_rate`** (double)

限制 tf 变换发布速率的速率（Hz）。如果设为 0，则不进行限制。此参数已弃用，不应再进行限制。

- 默认值：0.0
- 约束：大于或等于 0.0

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_pose_broadcaster:
  ros__parameters:
    pose_name: "test_pose"
    frame_id: "pose_frame"
```

---

## 5.7 GPS 传感器广播器（GPS Sensor Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/gps_sensor_broadcaster/doc/userdoc.html>

来自 GPS 传感器消息的广播器。发布的消息类型是 `sensor_msgs/msg/NavSatFix`。

该控制器是 `GPSSensor` 语义组件（见 `controller_interface` 包）的包装器。

### 5.7.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/orientation.x, ..., <sensor_name>/angular_velocity.x, ..., <sensor_name>/linear_acceleration.x`。

- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 默认值：""
- 约束：参数非空

**`static_position_covariance`** (double_array)

静态位置协方差。

- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

**`read_covariance_from_interface`** (bool)

从状态接口读取协方差。

- 默认值：false

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_gps_sensor_broadcaster:
  ros__parameters:
    sensor_name: gps_sensor
    frame_id: gps_sensor_frame
    service: service_gps
```

---

## 5.8 状态接口广播器（State Interfaces Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/state_interfaces_broadcaster/doc/userdoc.html>

状态接口广播器发布指定硬件接口的状态（double 数据类型）。广播器发布两个话题：

- `/state_interfaces_broadcaster/names`：以 `control_msgs/msg/Keys` 消息类型发布正在监控的硬件接口的名称；
- `/state_interfaces_broadcaster/values`：以 `control_msgs/msg/Float64Values` 消息类型发布指定硬件接口的当前状态值。

### 5.8.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`interfaces`** (string_array)

接口状态广播器要发布的硬件接口信息列表。

- 只读：True
- 默认值：{}
- 约束：参数非空

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_state_interfaces_broadcaster:
  ros__parameters:
    interfaces: ["joint1/position", "joint2/velocity"]
```

---

## 5.9 磁力计广播器（Magnetometer Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/magnetometer_broadcaster/doc/userdoc.html>

用于磁力计消息（类型：`sensor_msgs/msg/MagneticField`）的广播器，使用 `semantic_components::MagneticFieldSensor`。

### 5.9.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

#### 参数列表

**`sensor_name`** (string)

定义用作其接口前缀的传感器名称。接口名称是：`<sensor_name>/magnetic_field.x, <sensor_name>/magnetic_field.y, <sensor_name>/magnetic_field.z`。

- 只读：True
- 默认值：""
- 约束：参数非空

**`frame_id`** (string)

传感器发布值所在的 frame_id。

- 只读：True
- 默认值：""
- 约束：参数非空

**`static_covariance`** (double_array)

静态协方差。关于 x、y、z 轴按行主序排列。

- 只读：True
- 默认值：{0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0}
- 约束：长度必须等于 9

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_magnetometer_broadcaster:
  ros__parameters:
    sensor_name: magnetometer
    frame_id: magnetometer_frame
```

---

## 5.10 电池状态广播器（Battery State Broadcaster）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/battery_state_broadcaster/doc/userdoc.html>

_电池状态广播器_ 以 `sensor_msgs/msg/BatteryState` 消息发布电池状态信息。

它从一个或多个电池读取与电池相关的状态接口，并以标准 ROS 2 消息格式暴露它们。这使得与监控工具、日志系统和更高级别的决策节点轻松集成。

### 5.10.1 接口

广播器可以从每个配置的电池读取以下状态接口：

- `battery_voltage` _（必需 mandatory）_ (double)
- `battery_temperature` _（可选）_ (double)
- `battery_current` _（可选）_ (double)
- `battery_charge` _（可选）_ (double)
- `battery_percentage` _（可选）_ (double)
- `battery_power_supply_status` _（可选）_ (double)
- `battery_power_supply_health` _（可选）_ (double)
- `battery_present` _（可选）_ (bool)

### 5.10.2 发布的话题

广播器发布两个话题：

- `~/raw_battery_states`（`control_msgs/msg/BatteryStateArray`）：发布 **逐电池状态消息**，包含每个配置电池的原始值；
- `~/battery_state`（`sensor_msgs/msg/BatteryState`）：发布一个 **单一聚合电池消息**，表示所有电池的综合状态。

| 字段 | `battery_state` | `raw_battery_states` |
|---|---|---|
| `header.frame_id` | 空 | 电池名称 |
| `voltage` | 所有电池的平均值 | 来自电池的 `battery_voltage` 接口 _（必需）_（未测量则为 NaN） |
| `temperature` | 报告温度电池的平均值 | 如果启用，来自电池的 `battery_temperature` 接口，否则为 nan |
| `current` | 报告电流电池的平均值 | 如果启用，来自电池的 `battery_current` 接口，否则为 nan |
| `charge` | 报告电量的电池之和 | 如果启用，来自电池的 `battery_charge` 接口，否则为 nan |
| `capacity` | 所有电池之和 | 如果提供了电池的 `capacity` 参数，否则为 nan |
| `design_capacity` | 所有电池之和 | 如果提供了电池的 `design_capacity` 参数，否则为 nan |
| `percentage` | 报告/计算百分比的电池平均值 | 如果启用，来自电池的 `battery_percentage` 接口，否则根据电池的 `minimum_voltage` 和 `maximum_voltage` 参数计算 |
| `power_supply_status` | 报告的最高枚举值 | 如果启用，来自电池的 `battery_power_supply_status` 接口，否则为 0（unknown） |
| `power_supply_health` | 报告的最高枚举值 | 如果启用，来自电池的 `battery_power_supply_health` 接口，否则为 0（unknown） |
| `power_supply_technology` | 如果所有电池相同则原样报告，否则设为 _Unknown_ | 如果提供了电池的 `power_supply_technology` 参数，否则为 0（unknown） |
| `present` | True | 如果启用，来自电池的 `battery_present` 接口，否则如果电池电压值有效（不是 NaN 也不是 0.0）则为 true |
| `cell_voltage` | 空 | 空 |
| `cell_temperature` | 空 | 空 |
| `location` | 追加所有电池位置 | 如果提供了电池的 `location` 参数，否则为空 |
| `serial_number` | 追加所有电池序列号 | 如果提供了电池的 `serial_number` 参数，否则为空 |

### 5.10.3 参数

该控制器使用 generate_parameter_library 来管理参数。参数定义文件包含完整的列表和说明。

#### 参数列表

**`batteries`** (string_array)

将从其读取电池状态接口的电池列表。

- 只读：True
- 约束：不包含重复项

**`sensor_name`** (string)

[已弃用 DEPRECATED] 电池的传感器名称。如果提供，将使用该传感器的 'voltage' 状态接口来填充 BatteryState 消息中的电压字段。如果使用此参数，则忽略 batteries 和 interfaces 参数。

- 只读：True
- 默认值：""

**`design_capacity`** (double)

[已弃用 DEPRECATED] sensor_name 模式下电池的设计容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`power_supply_technology`** (int)

[已弃用 DEPRECATED] sensor_name 模式下的电池化学类型枚举（见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，technology 设为 unknown。

- 只读：True
- 默认值：0
- 约束：参数必须在 [0, 8] 范围内

**`interfaces.<batteries>.battery_temperature`** (bool)

是否从该电池的状态接口读取电池温度 [°C]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_current`** (bool)

是否从该电池的状态接口读取电池电流 [A]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_charge`** (bool)

是否从该电池的状态接口读取电池电量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_percentage`** (bool)

是否从该电池的状态接口读取电量水平 [%]（0.0 到 100.0）。如果未测量，则使用 minimum_voltage 和 maximum_voltage 参数（如果提供）计算线性百分比，否则为 NaN。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_power_supply_status`** (bool)

是否从该电池的状态接口读取电源状态（例如 Charging、Full，见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，状态设为 unknown。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_power_supply_health`** (bool)

是否从该电池的状态接口读取电源健康状况（例如 Good、Overheat，见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，健康状况设为 unknown。

- 只读：True
- 默认值：false

**`interfaces.<batteries>.battery_present`** (bool)

是否从该电池的状态接口读取电池存在状态（如果电池存在则为 true）。如果未测量，将从电池电压值推断存在性（如果电压不是 NaN 也不是 0.0 则为 true，否则为 false）。

- 只读：True
- 默认值：false

**`<batteries>.minimum_voltage`** (double)

电池最小电压（用于计算百分比）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.maximum_voltage`** (double)

电池最大电压（用于计算百分比）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.capacity`** (double)

上次已知的电池满容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.design_capacity`** (double)

电池的设计容量 [Ah]（未测量则为 NaN）。

- 只读：True
- 默认值：`std::numeric_limits<double>::quiet_NaN()`

**`<batteries>.power_supply_technology`** (int)

电池化学类型枚举（见 <https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg>）。如果未测量，technology 设为 unknown。

- 只读：True
- 默认值：0
- 约束：参数必须在 [0, 8] 范围内

**`<batteries>.location`** (string)

电池的物理位置（例如插槽编号或插头标签）。

- 只读：True
- 默认值：""

**`<batteries>.serial_number`** (string)

电池的序列号。

- 只读：True
- 默认值：""

#### 示例参数文件

该控制器的一个示例参数文件可在 test 目录中找到：

```yaml
test_battery_state_broadcaster:
  ros__parameters:
    batteries:
      - "battery0"
      - "battery1"
    interfaces:
      battery0:
        battery_temperature: true
        battery_current: false
        battery_charge: true
        battery_percentage: false
        battery_power_supply_status: true
        battery_power_supply_health: true
        battery_present: false
      battery1:
        battery_temperature: true
        battery_current: true
        battery_charge: true
        battery_percentage: true
        battery_power_supply_status: true
        battery_power_supply_health: true
        battery_present: false
    battery0:
      minimum_voltage: 0.0
      maximum_voltage: 10.0
      capacity: 12000.0
      design_capacity: 13000.0
      power_supply_technology: 3
      location: "slot0"
      serial_number: "serial_device_0"
    battery1:
      minimum_voltage: 0.0
      maximum_voltage: 15.0
      capacity: 17000.0
      design_capacity: 18000.0
      power_supply_technology: 3
      location: "slot1"
      serial_number: "serial_device_1"

# [deprecated] do not use for new configurations
test_battery_state_broadcaster_legacy:
      ros__parameters:
        batteries: ["battery_state"]
        battery_state:
          design_capacity: 100.0
          power_supply_technology: 2
```

#### 面向 `ipa320/ros_battery_monitoring` 用户的迁移

如果您之前使用的是 `ipa320/ros_battery_monitoring` 包中的 `battery_state_broadcaster`，您可以直接切换到本包。使用 `sensor_name` 的配置风格仍受支持以保持向后兼容，但可能在未来的版本中被移除。

要使您的设置适应新的 `battery_state_broadcaster` 配置：

1. 将您的硬件接口名称从 `voltage` 更新为 `battery_voltage`；
2. 将您的控制器参数从

```
battery_state_broadcaster:
  ros__parameters:
    sensor_name: "battery_state"
    design_capacity: 100.0
    # https://github.com/ros2/common_interfaces/blob/rolling/sensor_msgs/msg/BatteryState.msg
    power_supply_technology: 2
```

改为：

```
battery_state_broadcaster:
  ros__parameters:
    batteries: ["battery_state"]
    battery_state:
      design_capacity: 100.0
      power_supply_technology: 2
```

**注意**：

- 参数必须提供 **sensor_name** **或** batteries 中的任意一个；
- 如果两者都为空 → 广播器将配置失败；
- 如果两者都设置 → 广播器将抛出错误。
