package logic

import (
	"fmt"
	"server/model/collect"
	"server/model/system"
	"server/plugin/db"
	"strconv"
	"strings"
	"time"
)

type ProvideLogic struct{}

var PL *ProvideLogic

// GetClassList 获取格式化的分类列表
func (p *ProvideLogic) GetClassList() []collect.FilmClass {
	var classList []collect.FilmClass
	tree := system.GetCategoryTree()
	for _, c := range tree.Children {
		if c.Show {
			classList = append(classList, collect.FilmClass{
				TypeID:   c.Id,
				TypeName: c.Name,
			})
			for _, sub := range c.Children {
				if sub.Show {
					classList = append(classList, collect.FilmClass{
						TypeID:   sub.Id,
						TypeName: sub.Name,
					})
				}
			}
		}
	}
	return classList
}

// GetVodList 获取视频列表
func (p *ProvideLogic) GetVodList(t int, pg int, wd string, h int) (int, int, int, []collect.FilmList) {
	page := system.Page{PageSize: 20, Current: pg}
	if page.Current <= 0 {
		page.Current = 1
	}

	query := db.Mdb.Model(&system.SearchInfo{})

	if t > 0 {
		query = query.Where("cid = ? OR pid = ?", t, t)
	}

	if wd != "" {
		query = query.Where("name LIKE ? OR sub_title LIKE ?", "%"+wd+"%", "%"+wd+"%")
	}

	if h > 0 {
		timeLimit := time.Now().Add(-time.Duration(h) * time.Hour).Unix()
		query = query.Where("update_stamp >= ?", timeLimit)
	}

	var count int64
	query.Count(&count)
	page.Total = int(count)
	page.PageCount = int((page.Total + page.PageSize - 1) / page.PageSize)

	var sl []system.SearchInfo
	query.Limit(page.PageSize).Offset((page.Current - 1) * page.PageSize).Order("update_stamp DESC").Find(&sl)

	var vodList []collect.FilmList
	for _, s := range sl {
		vodList = append(vodList, collect.FilmList{
			VodID:       s.Mid,
			VodName:     s.Name,
			TypeID:      s.Cid,
			TypeName:    s.CName,
			VodEn:       s.Initial,
			VodTime:     time.Unix(s.UpdateStamp, 0).Format("2006-01-02 15:04:05"),
			VodRemarks:  s.Remarks,
			VodPlayFrom: "bracket", // 只有基础列表模式可以返回简单的站内标识
		})
	}

	return page.Current, page.PageCount, page.Total, vodList
}

// GetVodDetail 获取视频详情（带播放列表）
func (p *ProvideLogic) GetVodDetail(ids []string) []collect.FilmDetail {
	var detailList []collect.FilmDetail

	for _, idStr := range ids {
		idInt, err := strconv.Atoi(idStr)
		if err != nil {
			continue
		}
		var s system.SearchInfo
		if err := db.Mdb.Where("mid = ?", idStr).First(&s).Error; err != nil {
			continue // 跳过找不到的视频
		}

		// 通过 IndexLogic 获取结合了多线路的影片详细信息
		movieDetailVo := IL.GetFilmDetail(idInt)

		// 处理播放源和播放链接
		var playFromList []string
		var playUrlList []string

		for _, source := range movieDetailVo.List {
			playFromList = append(playFromList, source.Name) // 播放源名称
			var linkStrs []string
			for _, link := range source.LinkList {
				// 类似 "第1集$http://xxx.m3u8"
				linkStrs = append(linkStrs, fmt.Sprintf("%s$%s", link.Episode, strings.ReplaceAll(link.Link, "$", "")))
			}
			playUrlList = append(playUrlList, strings.Join(linkStrs, "#"))
		}

		detail := collect.FilmDetail{
			VodID:          s.Mid,
			TypeID:         s.Cid,
			TypeID1:        s.Pid,
			TypeName:       s.CName,
			VodName:        s.Name,
			VodEn:          s.Initial,
			VodTime:        time.Unix(s.UpdateStamp, 0).Format("2006-01-02 15:04:05"),
			VodRemarks:     s.Remarks,
			VodPlayFrom:    strings.Join(playFromList, "$$$"),
			VodPlayURL:     strings.Join(playUrlList, "$$$"),
			VodPic:         movieDetailVo.Picture,
			VodSub:         movieDetailVo.SubTitle,
			VodClass:       movieDetailVo.ClassTag,
			VodActor:       movieDetailVo.Actor,
			VodDirector:    movieDetailVo.Director,
			VodWriter:      movieDetailVo.Writer,
			VodBlurb:       movieDetailVo.Blurb,
			VodPubDate:     movieDetailVo.ReleaseDate,
			VodArea:        movieDetailVo.Area,
			VodLang:        movieDetailVo.Language,
			VodYear:        fmt.Sprintf("%d", movieDetailVo.Year),
			VodState:       movieDetailVo.State,
			VodHits:        s.Hits,
			VodScore:       fmt.Sprintf("%.1f", movieDetailVo.DbScore),
			VodContent:     movieDetailVo.Content,
		}
		detailList = append(detailList, detail)
	}

	return detailList
}
