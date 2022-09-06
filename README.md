# env
* node: v16.13.1
* npm: v8.1.2
* ionic: v6.20.1
* cordova-res: v0.15.4
* native-run: v1.6.0

# prepare list

* 下载NodeJs, download node & npm: https://nodejs.org/dist
* 安装全局依赖: npm install -g @ionic/cli@6.20.1 native-run@1.6.0 cordova-res@0.15.4
* 复制远程仓库到本地：git clone https://github.com/ararayan/circuit-monitor.git
* 切换分支： git switch split-store
* 安装依赖： npm install

# build & dev

* dev cmd: ionic serve
* prod build and sync resoure to android: ionic cap sync
