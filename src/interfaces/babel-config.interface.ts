import {Options} from "babel-helper-nej-transforms";

export interface PluginOptions extends Options {
    /**
     * 源码所在目录
     */
    root: string
}

export interface BabelConfig {
    /**
     * 转换文件的绝对地址
     */
    filename: string;
    /**
     * 插件配置想
     */
    opts: PluginOptions
}
