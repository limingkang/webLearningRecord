## docker

### 前言
虽然用户可以通过**虚拟机**还原软件的原始环境。但是，这个方案有几个缺点
- 虚拟机会独占一部分内存和硬盘空间。它运行的时候，其他程序就不能使用这些资源了。哪怕虚拟机里面的应用程序，真正使用的内存只有 1MB，虚拟机依然需要几百 MB 的内存才能运行
- 虚拟机是完整的操作系统，一些系统级别的操作步骤，往往无法跳过，比如用户登录
- 启动操作系统需要多久，启动虚拟机就需要多久。可能要等几分钟，应用程序才能真正运行


由于虚拟机存在这些缺点，Linux 发展出了另一种虚拟化技术：Linux 容器（Linux Containers，缩写为 LXC）。Linux 容器不是模拟一个完整的操作系统，而是对进程进行隔
离。或者说，在正常进程的外面套了一个保护层。对于容器里面的进程来说，它接触到的各种资源都是虚拟的，从而实现与底层系统的隔离。由于容器是进程级别的，相比虚拟机有很多优势
- 容器里面的应用，直接就是底层系统的一个进程，而不是虚拟机内部的进程。所以，启动容器相当于启动本机的一个进程，而不是启动一个操作系统，速度就快很多
- 容器只占用需要的资源，不占用那些没有用到的资源；虚拟机由于是完整的操作系统，不可避免要占用所有资源。另外，多个容器可以共享资源，虚拟机都是独享资源
- 容器只要包含用到的组件即可，而虚拟机是整个操作系统的打包，所以容器文件比虚拟机文件要小很多

总之，容器有点像轻量级的虚拟机，能够提供虚拟化的环境，但是成本开销小得多

**Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口**。它是目前最流行的 Linux 容器解决方案

Docker 的主要用途，目前有三大类
1. 提供一次性的环境。比如，本地测试他人的软件、持续集成的时候提供单元测试和构建的环境
2. 提供弹性的云服务。因为 Docker 容器可以随开随关，很适合动态扩容和缩容
3. 组建微服务架构。通过多个容器，一台机器可以跑多个服务，因此在本机就可以模拟出微服务架构


### image文件
**Docker 把应用程序及其依赖，打包在 image 文件里面**。只有通过这个文件，才能生成 Docker 容器。image 文件可以看作是容器的模板。Docker 根据 image 文件
生成容器的实例。同一个 image 文件，可以生成多个同时运行的容器实例

image 是二进制文件。实际开发中，一个 image 文件往往通过继承另一个 image 文件，加上一些个性化设置而生成。举例来说，你可以在 Ubuntu 的 image 基础上，往
里面加入 Apache 服务器，形成你的 image

``` shell
# 列出本机的所有 image 文件。
$ docker image ls

# 删除 image 文件
$ docker image rm [imageName]
```

image 文件是通用的，一台机器的 image 文件拷贝到另一台机器，照样可以使用。一般来说，为了节省时间，我们应该尽量使用别人制作好的 image 文件，而不是自
己制作。即使要定制，也应该基于别人的 image 文件进行加工，而不是从零开始制作

为了方便共享，image 文件制作完成后，可以上传到网上的仓库。Docker 的官方仓库 Docker Hub 是最重要、最常用的 image 仓库。此外，出售自己制作的 image 文件也是可以的

### 容器文件
**image 文件生成的容器实例，本身也是一个文件，称为容器文件**。也就是说，一旦容器生成，就会同时存在两个文件： image 文件和容器文件。而且关闭容器
并不会删除容器文件，只是容器停止运行而已
``` shell
# 列出本机正在运行的容器
$ docker container ls

# 列出本机所有容器，包括终止运行的容器
# 输出结果之中，包括容器的 ID。很多地方都需要提供这个 ID，比如上一节终止容器运行的docker container kill命令
$ docker container ls --all

# 终止运行的容器文件，依然会占据硬盘空间，可以使用命令删除
$ docker container rm [containerID]
```

### Dockerfile文件
它是一个文本文件，用来配置 image。Docker 根据 该文件生成二进制的 image 文件
``` dockerfile
# FROM  <image>[:<tag> | @<digest>] [AS <name>]
# FROM指定一个基础镜像，且必须为Dockerfile文件开篇的每个非注释行,至于image则可以是任何合理存在的image镜像
# FROM可以在一个Dockerfile中出现多次，以便于创建混合的images。如果没有指定tag,latest将会被指定为要使用的基础镜像版本
# AS name,可以给新的构建阶段赋予名称。该名称可用于后续FROM 和 COPY --from=<name | index>说明可以引用此阶段中构建的镜像
FROM xxxxxxxxxxxxx/image-base/node:10.9.0-jessie AS build-env
# 将当前目录下的所有文件（除了.dockerignore排除的路径），都拷贝进入 image 文件的/app目录
COPY . /app
# 指定接下来的工作路径为/app
WORKDIR /app
# 在/app目录下，运行npm install命令安装依赖。注意，安装后所有的依赖，都将打包进入 image 文件
RUN npm install --registry=https://registry.npm.taobao.org
# 将容器 3000 端口暴露出来， 允许外部连接这个端口
EXPOSE 3000
# 执行健康检查 cmd命令在容器启动后执行
HEALTHCHECK CMD curl -f http://localhost:${HTTP_PORT}/ || exit 1
# 容器启动时会先走该sh文件
ENTRYPOINT ["./entrypoint.sh"]
```

### docker常用命令
``` shell
# 查看某个服务的状态
docker ps|grep $name
# 停用某个服务
docker kill $imageId
# 删除本地docker镜像
docker rmi -f $imageId
# 查看docker中的变量
docker inspect $imageId
# 删除本地所有docker镜像
docker rmi `docker images -q` -f
# 删除某个容器
docker rm -f containerid
# 删除所有容器
docker rm -f `docker ps -a -q`
# 进入docker内部查看nginx配置
docker exec -it $imageId bash
docker exec -it $imageId sh
# 查看某个镜像的日志
docker logs -f  --tail=100 imageid
```		
		
### docker-compose
Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一
个命令，就可以从 YML 文件配置中创建并启动所有服务

Compose 使用的三个步骤：
1. 使用 Dockerfile 定义应用程序的环境
2. 使用 docker-compose.yml 定义构成应用程序的服务，这样它们可以在隔离环境中一起运行
3. 最后，执行 docker-compose up 命令来启动并运行整个应用程序,如果你想在后台执行该服务可以加上 -d 参数

``` yml
version: '2.1'
services:
  # 服务名
  Studio:
    # 依赖镜像
    image: nginx
    # image: harbor.test.com/bfop/base_tengine:fb186ee7-20200103-0349
    container_name: ${DEPLOY_CONTAINER}
    # 当前HTTP_PORT映射到80
    ports:
      - ${HTTP_PORT}:80
    mem_limit: 2048m
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: always
```
代码是在构建时静态复制到容器中的，即通过Dockerfile文件中的COPY src /opt/src命令实现物理主机中的源码复制到容器中，这样在后
续物理主机src目录中代码的更改不会反应到容器中

可以通过volumes 关键字实现物理主机目录挂载到容器中的功能（同时删除Dockerfile中的COPY指令，不需要创建镜像时将代码打包进镜
像，而是通过volums动态挂载，容器和物理host共享数据卷

通过volumes（卷）将主机上的项目目录（compose_test/src）挂载到容器中的/opt/src目录下，允许您即时修改代码，而无需重新构建镜像


## shell脚本
获取本地ip的方法脚本：
``` shell
ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|awk '{print $2}'|tr -d "addr:"|head -1
```
shift可以用来向左移动位置参数：
``` shell
#!/bin/bash
while [ $# != 0 ]
do
    echo -e "参数值为 $1, 参数个数为 $#"
    shift
done
```
Shell的名字 $0；第一个参数 $1；第二个参数 $2；第n个参数 $n；所有参数 $@ 或 $*；参数个数 $#

expr命令是一个手工命令行计数器，用于在UNIX/LINUX下求表达式变量的值，一般用于整数值，也可用于字符串

${BASH_SOURCE[0]}表示bash脚本的第一个参数（如果第一个参数是bash，表明这是要执行bash脚本，这时"${BASH_SOURCE[0]}"自动转换为第二个参数
``` shell
DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# 第一条语句就是获取当前目录
# 如果第一条语句顺利执行，就执行pwd显示当前目录，并将结果赋值给变量“DIR”
```

``` shell
source FileName
# 在当前bash环境下读取并执行FileName中的命令
```

``` shell
while read line
do
   sed -e "s/\${SELF_IP}/$SELF_IP/g" 
   # 对file里面所有SELF_IP替换值
done < file
# read通过输入重定向，把file的第一行所有的内容赋值给变量line，循环体内的命令一般包含对变量line的处理；
# 然后循环处理file的第二行、第三行。。。一直到file的最后一行
```

### envsubst命令
比如你现在有配置文件：decoder.conf里面有两个配置项写的是：
``` shell
THREAD_NUM:24
GPU_ID:0
```
现在你希望通过某个统一的配置来修改这些配置项，以免在部署的时候挨个去改动每个配置文件,那么可以如下操作：

1. 写一个统一配置文件config.conf里面写:
``` shell
export thread_num=24
export gpu_id=0
```
2. 将decoder.conf复制为decoder.conf.emplate,并将decoder.conf.template里面改为
``` shell
THREAD_NUM:${thread_num}
GPU_ID:${gpu_id}
```
3. 在命令行中输入：`source config.conf`

4. 在命令行中输入：`envsubst < decoder.conf.template > decoder.conf`

5. 如果只想替换THREAD_NUM，不想替换GPU_ID，那就在命令行输入:

`envsubst '${THREAD_NUM}' < decoder.conf.template > decoder.conf`




## 快速装机必备

### 首先安装我们需要的包,前端就是node git vscode
[node 安装地址](http://nodejs.cn/download/)

[git安装或者直接使用npm安装](https://www.git-scm.com/download/mac)
 

下载vscode之后直接装好对应插件
1. ESlint
2. Git history
3. GitLens `查看git提交记录`
4. Vetur `vue 语法高亮、错误提示、自动格式化等的插件`

特别的时候是，如果自动保存格式化失效的话，可以从新设置下，在preferences -> settings 找到extensions里面的eslint的配置，可以进去编辑json文件,给个下面的例子，
但是不通版本可能配置不太一样
``` json
{
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "editor.formatOnSave": true,
    "eslint.validate": [
        "javascript",
        "html",
        "vue"
    ],
    "workbench.editor.enablePreview": false,
    "files.autoSave": "onFocusChange",
    "explorer.confirmDelete": false,
    "js/ts.implicitProjectConfig.experimentalDecorators": true,
    "eslint.codeAction.showDocumentation": {
        "enable": true
    },
    "editor.defaultFormatter": "dbaeumer.vscode-eslint",
    "vscodeGoogleTranslate.preferredLanguage": "English",
}
```

接下来我们需要配置git的免密码登陆
1. 本机执行：ssh-keygen -t rsa
2. 遇到提示，直接回车就OK，秘钥生成在用户的根目录的.ssh目录下。比如小白用户的/home/xiaobai/.ssh目录下
3. 复制/home/xiaobai/.ssh/id_rsa.pub文件到目标服务器的/home/login_user/.ssh目录下，并重命名为authorized_keys
4. 如果目标服务器上存在authorized_keys文件，请将id_rsa.pub文件内容追加到authorized_keys,如果不存在.ssh，执行：ssh-keygen -t rsa 生成


接下来终端oh-my-zsh安装，提供两个命令:

`sh -c "$(curl -fsSL https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"`

`sh -c "$(wget https://raw.github.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)"`














