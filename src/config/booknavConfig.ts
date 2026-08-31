import type { BooknavGroup, BooknavPageConfig } from "../types/booknavConfig";

// 书签导航页面配置
export const booknavPageConfig: BooknavPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// favicon 自动获取配置
	favicon: {
		// 书签未填写 icon 时，是否自动获取目标站点的 favicon 图标
		enabled: true,

		// favicon 接口地址，{domain} 为占位符，会被替换成目标站点域名
		// 更换接口只需保证地址里含有 {domain}，例如：
		//   https://a.favicon.im/{domain}
		//   https://favicon.im/{domain}
		api: "https://a.favicon.im/{domain}",
	},
};

// 书签导航配置
// 每个数组项是一个分类组，分类组内的 items 是该分类下的书签
export const booknavConfig: BooknavGroup[] = [
	{
		id: "dev",
		name: "开发",
		icon: "material-symbols:code-rounded",
		desc: "写代码时离不开的站点",
		weight: 100,
		items: [
			{
				title: "GitHub",
				url: "https://github.com",
				desc: "全球最大的代码托管平台",
				icon: "fa7-brands:github",
				weight: 10,
			},
			{
				title: "Mermaid Live Editor",
				url: "https://mermaid.ai/app/projects/916aa769-40f9-4f6f-b801-e34bc329e3f2/diagrams/94e26119-c683-46fb-b1cc-6b83bcfeb242/version/v0.1/edit",
				desc: "Mermaid 图表在线编辑器",
				weight: 9,
			},
			{
				title: "Docker 实践",
				url: "https://vuepress.mirror.docker-practice.com/",
				desc: "Docker 实践教程文档（镜像站）",
				weight: 8,
			},
			{
				title: "D-Robotics RDK S600 开发文档",
				url: "https://developer.d-robotics.cc/rdk_s_doc/Advanced_development/linux_development/driver_development_super/driver_timesync?v=5.1.0&p=RDK+S600",
				desc: "D-Robotics RDK S600 开发者社区",
				weight: 7,
			},
		],
	},
	{
		id: "ros",
		name: "机器人 & DDS",
		icon: "material-symbols:smart-toy-outline-rounded",
		desc: "ROS2、Nav2、FastDDS 等机器人开发文档",
		weight: 95,
		items: [
			{
				title: "ROS2 官方文档（鱼香镜像）",
				url: "http://dev.ros2.fishros.com/",
				desc: "ROS2 机器人操作系统官方中文文档",
				weight: 10,
			},
			{
				title: "Nav2 官方文档（鱼香镜像）",
				url: "http://dev.nav2.fishros.com/",
				desc: "Nav2 导航框架官方中文文档",
				weight: 9,
			},
			{
				title: "Fast DDS 官方文档",
				url: "https://fast-dds.docs.eprosima.com/en/latest/fastdds/getting_started/getting_started.html",
				desc: "Fast DDS（CycloneDDS 继任者）官方文档",
				weight: 8,
			},
		],
	},
	{
		id: "opensource",
		name: "项目",
		icon: "material-symbols:code-rounded",
		desc: "好用的开源项目",
		weight: 90,
		items: [
			{
				title: "Firefly",
				url: "https://github.com/CuteLeaf/Firefly",
				desc: "清晰美观的 Astro 个人博客主题模板",
				icon: "/favicon/firefly-32.png",
				weight: 10,
			},
		],
	},
	{
		id: "design",
		name: "设计",
		icon: "material-symbols:palette-outline-rounded",
		desc: "配色、图标与灵感来源",
		weight: 90,
		items: [
			{
				title: "Iconify",
				url: "https://icon-sets.iconify.design",
				desc: "海量开源图标集合搜索",
				weight: 10,
			},
			{
				title: "iconfont",
				url: "https://www.iconfont.cn",
				desc: "阿里巴巴矢量图标库",
				weight: 9,
			},
		],
	},
	{
		id: "tools",
		name: "工具",
		icon: "material-symbols:build-outline-rounded",
		desc: "顺手的在线小工具",
		weight: 80,
		items: [
			{
				title: "TinyPNG",
				url: "https://tinypng.com",
				desc: "在线压缩 PNG / JPEG 图片",
				weight: 10,
			},
			{
				title: "Squoosh",
				url: "https://squoosh.app",
				desc: "Google 出品的图片压缩与格式转换",
				weight: 9,
			},
			{
				title: "Carbon",
				url: "https://carbon.now.sh",
				desc: "把代码片段生成漂亮的图片",
				weight: 8,
			},
		],
	},
	{
		id: "resources",
		name: "资源",
		icon: "material-symbols:auto-stories-outline-rounded",
		desc: "文档、教程与阅读",
		weight: 70,
		items: [
			{
				title: "Firefly Docs",
				url: "https://docs-firefly.cuteleaf.cn",
				desc: "Firefly 主题模板文档",
				icon: "https://docs-firefly.cuteleaf.cn/logo.png",
				weight: 10,
			},
			{
				title: "夏夜流萤",
				url: "https://blog.cuteleaf.cn",
				desc: "飞萤之火自无梦的长夜亮起",
				weight: 9,
			},
		],
	},
];
