package main

import (
	"fmt"
	"server/config"
	"server/model/system"
	"server/plugin/SystemInit"
	"server/plugin/db"
	"server/router"
	"time"
)

func init() {
	// 执行初始化前等待20s , 让mysql服务完成初始化指令
	time.Sleep(time.Second * 20)
	//初始化redis客户端
	err := db.InitRedisConn()
	if err != nil {
		panic(err)
	}
	// 初始化mysql
	err = db.InitMysql()
	if err != nil {
		panic(err)
	}
}

func main() {
	start()
}

func start() {
	// 启动前先执行数据库内容的初始化工作
	DefaultDataInit()
	// 开启路由监听
	r := router.SetupRouter()
	_ = r.Run(fmt.Sprintf(":%s", config.ListenerPort))
}

func DefaultDataInit() {
	// 1. 数据库表结构初始化 (仅在用户表不存在时执行)
	if !system.ExistUserTable() {
		SystemInit.TableInIt()
	}

	// 2. 网站基础配置和轮播图 (改为检查 Redis Key 是否存在，确保清空 Redis 后能自动恢复)
	SystemInit.BasicConfigInit()
	SystemInit.BannersInit()

	// 3. 初始化影视来源和定时任务 (内部已带有存在性检查)
	SystemInit.SpiderInit()
}
