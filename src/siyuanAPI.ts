/*
 * Copyright (c) 2023, Terwer . All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Terwer designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Terwer in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Terwer, Shenzhen, Guangdong, China, youweics@163.com
 * or visit www.terwer.space if you need additional information or have any
 * questions.
 */

import { info, debug, error } from './utils'
import { configs } from './configs'
import { fetchPost } from "siyuan"

const siyuanApiUrl = ""
const siyuanApiToken = ""
// const mediaDir = `./assets`


/**
 * 思源 API 返回类型
 */
export interface SiyuanData {
  /**
   * 非 0 为异常情况
   */
  code: number

  /**
   * 正常情况下是空字符串，异常情况下会返回错误文案
   */
  msg: string

  /**
   * 可能为 \{\}、[] 或者 NULL，根据不同接口而不同
   */
  data: any[] | object | null | undefined
}

export class BaseApi {
  /**
   * 向思源请求数据
   *
   * @param url - url
   * @param data - 数据
   */
  public async siyuanRequest(url: string, data: object): Promise<SiyuanData> {
    const reqUrl = `${siyuanApiUrl}${url}`

    const fetchOps = {
      body: JSON.stringify(data),
      method: "POST",
    }

    if (siyuanApiToken !== "") {
      Object.assign(fetchOps, {
        headers: {
          Authorization: `Token ${siyuanApiToken}`,
        },
      })
    }

    debug("开始向思源请求数据，reqUrl=>", reqUrl)
    debug("开始向思源请求数据，fetchOps=>", fetchOps)

    const response = await fetch(reqUrl, fetchOps)
    const resJson = (await response.json()) as SiyuanData

    debug("思源请求数据返回，resJson=>", resJson)

    if (resJson.code === -1) {
      throw new Error(resJson.msg)
    }
    return resJson
  }
}

/**
 * 思源笔记服务端API v2.8.8
 *
 * @see {@link https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md API}
 *
 * @author terwer
 * @version 1.0.0
 * @since 1.0.0
 */
export class KernelApi extends BaseApi {
    /**
     * 列出笔记本
     */
    public async lsNotebooks(): Promise<SiyuanData> {
      return await this.siyuanRequest("/api/notebook/lsNotebooks", {})
    }
  
    /**
     * 打开笔记本
     *
     * @param notebookId - 笔记本ID
     */
    public async openNotebook(notebookId: string): Promise<SiyuanData> {
      return await this.siyuanRequest("/api/notebook/openNotebook", {
        notebook: notebookId,
      })
    }
  
    /**
     * 列出文件
     *
     * @param path - 路径
     */
    public async readDir(path: string): Promise<SiyuanData> {
      return await this.siyuanRequest("/api/file/readDir", {
        path: path,
      })
    }
  
    /**
     * 写入文件
     *
     * @param path - 文件路径，例如：/data/20210808180117-6v0mkxr/20200923234011-ieuun1p.sy
     * @param file - 上传的文件
     */
    public putFile(path: string, file: any): Promise<SiyuanData> {
      const formData = new FormData()
      formData.append("path", path)
      formData.append("isDir", "false")
      formData.append("modTime", Math.floor(Date.now() / 1000).toString())
      formData.append("file", file)
  
      return new Promise((resolve, reject) => {
        fetchPost("/api/file/putFile", formData, (data) => {
          if (data.code === 0) {
            resolve(data)
          } else {
            reject(data)
          }
        })
      })
    }
  
    public async saveTextData(fileName: string, data: any) {
      return new Promise((resolve) => {
        const pathString = `/temp/convert/pandoc/${fileName}`
        const file = new File([new Blob([data])], pathString.split("/").pop())
        const formData = new FormData()
        formData.append("path", pathString)
        formData.append("file", file)
        formData.append("isDir", "false")
        fetchPost("/api/file/putFile", formData, (response) => {
          resolve(response)
        })
      })
    }
  
    /**
     * 转换服务
     *
     * @param from - 原始文件名，不包括路径，路径必须放在 /temp/convert/pandoc
     * @param to - 转换后的文件名，不包括路径，路径相对于 /temp/convert/pandoc
     */
    // public async convertPandoc(from: string, to: string): Promise<SiyuanData> {
    //   const params = {
    //     args: [
    //       "--to",
    //       "markdown_github-raw_html+tex_math_dollars+pipe_tables",
    //       from,
    //       "-o",
    //       to,
    //       "--extract-media",
    //       `${mediaDir}/${shortHash(from).toLowerCase()}`,
    //       "--wrap=none",
    //     ],
    //   }
    //   return await this.siyuanRequest("/api/convert/pandoc", params)
    // }
  
    // public async convertPandocCustom(args: string[]): Promise<SiyuanData> {
    //   const params = {
    //     args: args,
    //   }
    //   return await this.siyuanRequest("/api/convert/pandoc", params)
    // }
  
    /**
     * 读取文件
     *
     * @param path - 文件路径，例如：/data/20210808180117-6v0mkxr/20200923234011-ieuun1p.sy
     * @param type - 类型
     */
    public async getFile(path: string, type: "text" | "json") {
      const response = await fetch(`${siyuanApiUrl}/api/file/getFile`, {
        method: "POST",
        headers: {
          Authorization: `Token ${siyuanApiToken}`,
        },
        body: JSON.stringify({
          path: path,
        }),
      })
      if (response.status === 200) {
        if (type === "text") {
          return await response.text()
        }
        if (type === "json") {
          return (await response.json()).data
        }
      }
      return null
    }
  
    /**
     * 删除文件
     *
     * @param path - 路径
     */
    public async removeFile(path: string): Promise<SiyuanData> {
      const params = {
        path: path,
      }
      return await this.siyuanRequest("/api/file/removeFile", params)
    }
  
    /**
     * 通过 Markdown 创建文档
     *
     * @param notebook - 笔记本
     * @param path - 路径
     * @param md - md
     */
    public async createDocWithMd(notebook: string, path: string, md: string): Promise<SiyuanData> {
      const params = {
        notebook: notebook,
        path: path,
        markdown: md,
      }
      return await this.siyuanRequest("/api/filetree/createDocWithMd", params)
    }
  
    /**
     * 导入 Markdown 文件
     *
     * @param localPath - 本地 MD 文档绝对路径
     * @param notebook - 笔记本
     * @param path - 路径
     */
    // public async importStdMd(localPath, notebook: string, path: string): Promise<SiyuanData> {
    //   const params = {
    //     // Users/terwer/Documents/mydocs/SiYuanWorkspace/public/temp/convert/pandoc/西蒙学习法：如何在短时间内快速学会新知识-友荣方略.md
    //     localPath: localPath,
    //     notebook: notebook,
    //     toPath: path,
    //   }
    //   return await this.siyuanRequest("/api/import/importStdMd", params)
    // }

    public async getInstalledTheme(): Promise<SiyuanData> {
      return await this.siyuanRequest("api/bazaar/getInstalledTheme", {})
    }
}