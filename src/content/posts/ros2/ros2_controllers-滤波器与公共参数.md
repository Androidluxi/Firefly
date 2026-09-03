---
title: "ros2_controllers 官方文档（六）：滤波器与公共控制器参数"
published: 2026-08-31
description: "ros2_controllers 中文翻译：链式滤波控制器（Chained Filter Controller）与公共控制器参数（update_rate、is_async 等）说明。"
image: ""
tags: ["ROS2", "机器人", "ros2_control", "翻译", "ros2_controllers", "滤波器"]
category: ROS2专题
slug: ros2-controllers-filters-and-common-params
series: "ROS2-Control 官方文档中文翻译"
seriesOrder: 10
draft: false
lang: "zh-CN"
---

> **原文地址**：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>
> **原文版本**：ROS 2 Jazzy（较旧但仍受支持的版本，最新版见 Kilted）
> **翻译说明**：本文为《ros2_controllers 官方文档（Jazzy 版）中文翻译》系列分篇，覆盖「滤波器（Filters）、公共控制器参数」。正文与说明文字译为中文；代码、命令、参数名、消息类型、ROS 标识符、数学公式保留原文；关键术语在首次出现时标注英文原文。
> **原文档仓库**：<https://github.com/ros-controls/ros2_controllers>

# 6. 滤波器（Filters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

用于状态接口滤波的可链式控制器。它们将滤波后的值作为状态接口导出，可供其他控制器或广播器使用，并且不向 ROS 话题发布。

## 6.1 链式滤波控制器（Chained Filter Controller）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/chained_filter_controller/doc/userdoc.html>

该控制器包装了 filters 包中的 `filter_chain` 库。它允许将多个滤波器链接在一起，其中一个滤波器的输出是下一个滤波器的输入。该控制器可用于对单个接口应用一系列滤波器，将相同的滤波器链应用于多个接口，或将不同的滤波器链应用于不同的接口。

### 6.1.1 参数

该控制器使用 generate_parameter_library 来处理其参数。位于 src 文件夹中的参数定义文件包含控制器使用的所有参数的说明。

完整参数列表：

**`input_interfaces`** (string_array)

输入状态接口的名称。

- 只读：True
- 默认值：{}
- 约束：参数非空

**`output_interfaces`** (string_array)

输出状态接口的名称。

- 只读：True
- 默认值：{}
- 约束：参数非空

**`filter_chain`**

定义滤波器链的参数映射，以 filterN 为键。适用于所有接口，如果设置则覆盖 `<input_interfaces>.filter_chain`。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

**`<input_interfaces>.filter_chain`**

除了单一配置外，还可以为每个输入接口提供不同的配置。键是输入接口的名称，值是定义滤波器链的参数映射，以 filterN 为键。每个滤波器的字段有：type：要加载的滤波器插件；name：语义上描述滤波器的实际名称，例如 low_pass_filter；params：特定滤波器所需的底层参数映射，请参阅具体滤波器文档。

该控制器的一个示例参数文件（单接口）可在 test 目录中找到：

```yaml
test_chained_filter:
  ros__parameters:
    filter_chain:
      filter1:
        name: filter1
        type: "filters/MeanFilterDouble"
        params:
          number_of_observations: 2
    input_interfaces: ["wheel_left/position"]
    output_interfaces: ["wheel_left/filtered_position"]
```

或多接口：

```yaml
test_chained_filter_multiple_interfaces:
  ros__parameters:
    filter_chain:
      filter1:
        name: position_filter
        type: "filters/MeanFilterDouble"
        params:
          number_of_observations: 2
    input_interfaces:
      - "wheel_left/position"
      - "wheel_right/position"
    output_interfaces:
      - "wheel_left/filtered_position"
      - "wheel_right/filtered_position"

test_chained_filter_multiple_interfaces_config_per_input:
  ros__parameters:
    input_interfaces:
      - "wheel_left/position"
      - "wheel_right/position"
    output_interfaces:
      - "wheel_left/filtered_position"
      - "wheel_right/filtered_position"
    wheel_left/position:
      filter_chain:
        filter1:
          name: wheel_left_filter
          type: "filters/MeanFilterDouble"
          params:
            number_of_observations: 2
    wheel_right/position:
      filter_chain:
        filter1:
          name: wheel_right_filter
          type: "filters/MeanFilterDouble"
          params:
            number_of_observations: 3
```

---



---

---

# 7. 公共控制器参数（Common Controller Parameters）

> 原文：<https://control.ros.org/jazzy/doc/ros2_controllers/doc/controllers_index.html>

每个控制器和广播器都有一些公共参数。它们是可选的，但如果需要，必须在 `onConfigure` 转换到 `inactive` 状态之前设置，参见生命周期文档。一旦控制器已加载，此转换通过 controller_manager 的 `configure_controller` 服务完成。

- `update_rate`：一个无符号整数参数，表示每个控制器/广播器运行其更新周期的速率。当未指定时，它们以与 controller_manager 相同的频率运行。
- `is_async`：一个布尔参数，用于指定控制器更新是否需要异步运行。


## 附录：本中文文档覆盖范围说明

本中文文档对 ros2_controllers 官方文档（jazzy 版）中全部 37 个技术页面进行了全文翻译，覆盖范围如下：

**指南类（2 页）**
- 轮式移动机器人运动学（Wheeled Mobile Robot Kinematics）
- 编写新控制器指南（Writing a New Controller）

**移动机器人运动控制器（7 页）**
- 差速驱动控制器（diff_drive_controller）
- 麦克纳姆轮驱动控制器（mecanum_drive_controller）
- 全向轮驱动控制器（omni_wheel_drive_controller）
- 转向控制器库（steering_controllers_library，含 bicycle/tricycle/ackermann_steering 三个子页）
- 三轮车控制器（tricycle_controller）

**通用/工业控制器（8 页）**
- 导纳控制器（admittance_controller）
- 力控制器（effort_controllers）
- 前馈命令控制器（forward_command_controller）
- 夹爪控制器（gripper_controllers）
- GPIO 控制器（gpio_controllers）
- 平行夹爪动作控制器（parallel_gripper_controller）
- PID 控制器（pid_controller）
- 位置控制器（position_controllers）/ 速度控制器（velocity_controllers）
- 运动原语控制器（motion_primitives_controllers）

**关节轨迹控制器系列（6 页）**
- joint_trajectory_controller 主文档、轨迹表示、轨迹替换、取消时减速、速度缩放、参数详情、rqt_joint_trajectory_controller

**传感器/状态广播器（10 页）**
- force_torque_sensor_broadcaster（含力/力矩变换节点）、imu_sensor_broadcaster、joint_state_broadcaster、range_sensor_broadcaster、pose_broadcaster、gps_sensor_broadcaster、state_interfaces_broadcaster、magnetometer_broadcaster、battery_state_broadcaster、chained_filter_controller

翻译约定：
- 正文译为中文；代码、YAML 示例、命令、参数名、ROS 标识符、消息/接口类型、公式保留原文；
- 专业术语首次出现时标注英文原文；
- 每个章节顶部附原文档链接，便于对照查阅。
