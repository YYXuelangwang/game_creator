/**
* name 
*/
export enum globalTaskFlags {
	// 需要在开始时取消的任务标记
	GLOBAL_TASK_CANCEL_WHEN_START,

	// 奖励动画的任务标记(大，中， 小奖等)
	GLOBAL_TASK_REWARDS_ANI_TASK,

	// 奖励动画的任务标记(普通奖)
	GLOBAL_TASK_NORMAL_REWARDS_ANI_TASK,

	// 免费游戏结束
	GLOBAL_TASK_FREE_GAME_OVER,

	// 被延迟的任务
	GLOBAL_TASK_DELAYED_TASK,

	// 免费游戏开始动画
	GLOBAL_TASK_FREE_GAME_START,

}