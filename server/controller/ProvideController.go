package controller

import (
	"server/logic"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// HandleProvide 提供给外界采集的 MacCMS 兼容接口
func HandleProvide(c *gin.Context) {
	ac := c.Query("ac")
	t, _ := strconv.Atoi(c.DefaultQuery("t", "0"))
	pg, _ := strconv.Atoi(c.DefaultQuery("pg", "1"))
	wd := c.Query("wd")
	h, _ := strconv.Atoi(c.DefaultQuery("h", "0"))
	ids := c.Query("ids")

	// 处理不同类型的请求
	switch ac {
	case "list":
		// 返回简单的视频列表和分类
		classList := logic.PL.GetClassList()
		page, pagecount, total, vodList := logic.PL.GetVodList(t, pg, wd, h)
		c.JSON(200, gin.H{
			"code":      1,
			"msg":       "数据列表",
			"page":      page,
			"pagecount": pagecount,
			"limit":     "20",
			"total":     total,
			"list":      vodList,
			"class":     classList,
		})
	case "videolist", "detail":
		// 返回详细的视频信息（包含播放地址）
		classList := logic.PL.GetClassList()
		var idsArr []string
		if ids != "" {
			idsArr = strings.Split(ids, ",")
			vodList := logic.PL.GetVodDetail(idsArr)
			c.JSON(200, gin.H{
				"code":      1,
				"msg":       "数据详情",
				"page":      1,
				"pagecount": 1,
				"limit":     "20",
				"total":     len(vodList),
				"list":      vodList,
				"class":     classList,
			})
		} else {
			// 如果没有传入ids，那么返回列表但是附带完整详情（有些客户端要求视频列表带详情）
			// 为了保证性能，通常 videolist 不带ids时还是返回普通列表或者不完整详情，但根据CMS规范可以通过 GetVodList 返回简单信息后再补充
			// 这里我们为了简单起见，且由于不带 ids 的 videolist 查询压力很大，通常客户端会有默认ids，或者分步请求
			page, pagecount, total, vodList := logic.PL.GetVodList(t, pg, wd, h)
			
			// 取出 ids 去查详情
			var _idsArr []string
			for _, v := range vodList {
				_idsArr = append(_idsArr, strconv.FormatInt(v.VodID, 10))
			}
			
			detailList := logic.PL.GetVodDetail(_idsArr)
			
			c.JSON(200, gin.H{
				"code":      1,
				"msg":       "数据详情",
				"page":      page,
				"pagecount": pagecount,
				"limit":     "20",
				"total":     total,
				"list":      detailList,
				"class":     classList,
			})
		}

	default:
		// 默认返回基础分类和简单的视频列表
		classList := logic.PL.GetClassList()
		page, pagecount, total, vodList := logic.PL.GetVodList(t, pg, wd, h)
		c.JSON(200, gin.H{
			"code":      1,
			"msg":       "数据列表",
			"page":      page,
			"pagecount": pagecount,
			"limit":     "20",
			"total":     total,
			"list":      vodList,
			"class":     classList,
		})
	}
}

// HandleProvideConfig 提供给 TVBox/影视仓 的一键网络配置 (config.json)
func HandleProvideConfig(c *gin.Context) {
	// 动态获取当前请求的主机地址(包含协议和端口)
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}
	host := c.Request.Host
	apiPath := scheme + "://" + host + "/provide/vod/"

	configJson := gin.H{
		"spider":    "",
		"wallpaper": "",
		"logo":      "",
		"sites": []gin.H{
			{
				"key":         "Bracket",
				"name":        "🌟 Bracket 私人影视库全量",
				"type":        1,
				"api":         apiPath,
				"searchable":  1,
				"quickSearch": 1,
				"filterable":  1,
			},
		},
	}
	
	c.JSON(200, configJson)
}
