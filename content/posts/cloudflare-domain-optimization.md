---
title: "Cloudflare 域名优选：给你的站点挑一条最快的路"
date: "2026-05-12"
category: "技术"
tags: ["Cloudflare", "DNS", "CDN", "网络优化", "运维"]
excerpt: "Cloudflare 很快，但不一定对你最快。域名优选的核心思路是——不换服务器，只换路：主动筛选延迟最低的 Cloudflare 节点 IP，让访问者走最快的路到达你的站点。"
order: 2
hidden: false
cover: null
---

> **提示：本文由 AI 生成**

## 一个反直觉的事实

把域名接入 Cloudflare，开启 CDN 代理，理论上应该变快。

但很多人实际测下来，套了 CF 之后反而更慢了——首屏加载变慢，TTFB 飙升，甚至偶尔超时。问题不在 Cloudflare 本身，而在于一个容易被忽略的事实：**你的流量可能走了一条并非最优的路。**

这篇文章要讲的就是怎么找到那条最快的路。

## 问题出在哪里

要理解域名优选，需要先理解 Cloudflare 的网络架构。

### Anycast：一把钥匙开所有的门

Cloudflare 在全球 300+ 城市部署了边缘节点，这些节点共享同一组 IP 地址——这就是 **Anycast**。当你访问一个使用 Cloudflare 的网站时，DNS 返回的是这组共享 IP 中的一个，然后由 BGP 路由协议决定你的请求被送到哪个物理节点。

关键点在于：**BGP 选的是「拓扑最近」，不是「延迟最低」。**

拓扑最近指的是自治系统（AS）路径上的跳数最少。但网络不是纸面上的拓扑图——中间可能存在拥塞、绕行、互联互通瓶颈。跳数少不等于实际体验好。

### 大陆用户的特殊困境

对中国大陆用户而言，这个问题尤为突出。Cloudflare 在大陆没有节点，所有流量都要出境。BGP 的路由决策在复杂的国际互联环境下经常不够理想——你的请求可能先飞到洛杉矶再绕回来，或者挤在一条已经不堪重负的海缆上。

结果就是：DNS 给你一个 Cloudflare IP，这个 IP 理论上指向「最近的」节点，但实际上那条路并不快。

## 域名优选的原理

理解了问题，解法就清晰了。

### 一个关键特性

Cloudflare 的 Anycast 网络有一个重要特性：**任何一个 Anycast IP 都能代理所有接入 Cloudflare 的域名。**

当你的请求到达 Cloudflare 的任意一个边缘节点时，节点根据 HTTP `Host` 头（或 TLS 的 SNI）来确定你要访问的域名，然后从源站拉取内容。它不关心你是通过哪个 IP 进来的——只要这个 IP 属于 Cloudflare 的 Anycast 段，且你的域名在 Cloudflare 上正确配置了代理。

这意味着：**你可以自由选择通过哪个 Cloudflare IP 来访问你的站点。**

### 域名优选的核心逻辑

1. Cloudflare 公开了所有 Anycast IP 段
2. 这些 IP 段包含数百个可用 IP
3. 不同 IP 从你的网络环境访问，延迟和带宽差异显著
4. 找出对你最快的 IP，让 DNS 把你的域名解析到它

不换服务器，不换 Cloudflare，只换一条路。

## 实操：测速选 IP

### 获取 Cloudflare IP 段

Cloudflare 官方公开了所有 Anycast IP 段：

```bash
# IPv4
curl -s https://www.cloudflare.com/ips-v4

# IPv6
curl -s https://www.cloudflare.com/ips-v6
```

当前 IPv4 段共 15 组 CIDR，涵盖数十万可用 IP。完整列表也可以在工具内置的 `ip.txt` 中找到，无需手动维护。

### 安装 CloudflareSpeedTest

手动逐个 ping 显然不现实。[CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest)（简称 CFST）是社区最主流的测速工具，由 XIU2 开发维护，支持 ICMP 延迟测试和下载速度测试，自带 CF IP 段数据。

根据操作系统下载对应版本：

| 平台 | 下载文件 |
|------|----------|
| Linux 64 位 | `CloudflareST_linux_amd64.tar.gz` |
| Linux ARM64 | `CloudflareST_linux_arm64.tar.gz` |
| macOS Intel | `CloudflareST_darwin_amd64.tar.gz` |
| macOS Apple Silicon | `CloudflareST_darwin_arm64.tar.gz` |
| Windows 64 位 | `CloudflareST_windows_amd64.zip` |

Linux 下的安装与运行：

```bash
# 下载（从 GitHub Releases 页面获取最新版本链接）
wget -N https://github.com/XIU2/CloudflareSpeedTest/releases/latest/download/CloudflareST_linux_amd64.tar.gz
tar -zxf CloudflareST_linux_amd64.tar.gz
chmod +x CloudflareST

# 运行默认测速
./CloudflareST
```

Windows 下解压后直接双击 `CloudflareST.exe` 运行，或在终端中带参数执行。

### 测速流程详解

运行 `./CloudflareST` 后，工具会依次执行以下步骤：

1. **加载 IP 段**：读取内置的 `ip.txt`，包含 CF 官方公布的全部 IPv4 CIDR
2. **ICMP 延迟测试**：对所有 IP 段进行批量 ping 测试（默认 200 并发线程，每 IP 测 10 次取均值）
3. **筛选**：剔除延迟超过阈值（默认 200ms）和丢包的 IP
4. **下载速度测试**：对延迟达标的前 N 个 IP（默认 10 个）进行实际下载测速（默认每个 IP 测 10 秒）
5. **输出结果**：按综合排名输出到 `result.csv` 和终端

全程自动，通常 1-3 分钟完成。

### 参数详解

默认参数适用于大多数场景，但根据实际需求调整可以获得更精准的结果：

```bash
# 基础测试：200 线程，延迟上限 200ms，速度下限 5 MB/s
./CloudflareST -n 200 -t 10 -tl 200 -sl 5

# 仅测延迟不测速度（适合快速筛选）
./CloudflareST -dd

# ICMP 被封时，改用 HTTP 协议测延迟
./CloudflareST -httping -tp 443

# 指定优选的 CF 节点机房（如只想要香港、日本、美西的节点）
./CloudflareST -cfcolo HKG,NRT,LAX,SJC

# 用自己站点的文件测下载速度（更贴近实际场景）
./CloudflareST -url https://yourdomain.com/testfile.bin
```

完整参数一览：

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `-n` | 测速线程数（过高可能导致结果不准） | 200 |
| `-t` | 延迟测试次数（取平均值） | 10 |
| `-dn` | 延迟测试后保留多少个 IP 进入下载测试 | 10 |
| `-dt` | 每个 IP 的下载测速时长（秒） | 10 |
| `-tp` | 延迟测试端口（默认 ICMP，可选 80/443 等 TCP 端口） | ICMP |
| `-tl` | 延迟上限（ms），超过此值的 IP 淘汰 | 200 |
| `-tll` | 延迟下限（ms），低于此值的也淘汰 | 0 |
| `-tlr` | 延迟淘汰倍数（淘汰延迟 > 最低延迟 × 此倍数的结果） | 1.2 |
| `-sl` | 下载速度下限（MB/s），低于此值的 IP 淘汰 | 0 |
| `-p` | 输出结果数量（`0` 表示输出全部） | 10 |
| `-f` | 自定义 IP 范围文件路径 | `ip.txt` |
| `-o` | 自定义输出结果文件路径 | `result.csv` |
| `-dd` | 禁用下载测速（仅测延迟） | — |
| `-allip` | 遍历所有 IP（默认只测每个 C 段第一个 IP） | — |
| `-cfcolo` | 指定优选的 CF 节点机房代码 | — |
| `-httping` | 用 HTTP 协议代替 ICMP 测延迟 | — |
| `-url` | 自定义下载测速文件 URL | CF 默认文件 |

### 结果解读

测速完成后，工具在当前目录生成 `result.csv`：

```csv
IP 地址, 已发送, 已接收, 丢包率, 平均延迟, 下载速度 (MB/s)
104.21.xx.xx, 10, 10, 0.00, 148.23, 18.52
172.67.xx.xx, 10, 10, 0.00, 155.41, 15.18
```

各字段含义：

- **已发送 / 已接收**：延迟测试的发包和收包数量
- **丢包率**：越低越好，0% 为最佳；丢包严重的 IP 直接排除
- **平均延迟**：单位 ms，决定 TTFB，对文本类站点最为关键
- **下载速度**：单位 MB/s，决定大文件和图片的加载耗时

选 IP 的策略取决于站点类型。博客以文本为主，**延迟权重高于速度**——选延迟最低且丢包率为 0 的 IP。如果有大量图片或文件下载需求，则要兼顾下载速度。

### 自定义 IP 范围

如果不想测全部 CF IP 段（节省时间），可以编辑 `ip.txt` 文件，只保留感兴趣的网段：

```text
# 只测 104.16.0.0/13 和 172.64.0.0/13 两个段
104.16.0.0/13
172.64.0.0/13
```

或者从优选域名解析出 IP，单独测试：

```bash
# 从优选域名解析 IP
nslookup visa.com

# 将解析到的 IP 写入自定义文件
echo "1.2.3.4" > custom_ips.txt

# 用自定义文件测速
./CloudflareST -f custom_ips.txt -dd -p 0
```

## 落地：接入你的域名

测出了最快的 IP，接下来要让它生效。根据场景不同，有几种接入方案。

### 方案一：修改 hosts（个人使用）

最简单粗暴，适合只有自己需要加速的场景：

```bash
# Linux/macOS: /etc/hosts
# Windows: C:\Windows\System32\drivers\etc\hosts

104.21.xx.xx  yourdomain.com
```

保存后立即生效，但只影响本机。

### 方案二：CNAME 接入 + 分线路 DNS

要让所有访问者都受益，必须在 DNS 层面做文章。

**理解两种接入方式的区别：**

- **NS 接入**：将域名的 NS 记录指向 Cloudflare，DNS 解析完全由 CF 控制——你无法指定解析到哪个 IP
- **CNAME 接入**：域名 NS 不变，通过 CNAME 记录指向 Cloudflare——DNS 由你自己管理，可以自由控制解析结果

如果当前是 NS 接入，需要将 DNS 迁移到支持**分线路解析**的第三方服务（如 DNSPod、阿里云 DNS），然后通过 Cloudflare Partner 以 CNAME 方式接入。

**具体步骤：**

1. 在 Cloudflare Partner 面板（如国内常见的 CF 合作伙伴）添加域名，选择 CNAME 接入方式
2. Partner 面板会给出两到三条 CNAME 验证记录
3. 在第三方 DNS 服务中添加这些 CNAME 记录，完成域名验证
4. 在 CF 面板中开启代理（橙色云朵）

完成 CNAME 接入后，DNS 解析权在你手中，可以自由配置优选 IP。

**配置分线路解析：**

以 DNSPod 为例，在控制台中为同一个主机记录添加多条解析，分别指定不同的线路：

| 主机记录 | 记录类型 | 线路类型 | 记录值 | TTL |
|----------|----------|----------|--------|-----|
| blog | A | 电信 | 104.16.xx.xx（电信优选 IP） | 600 |
| blog | A | 联通 | 172.67.xx.xx（联通优选 IP） | 600 |
| blog | A | 移动 | 104.17.xx.xx（移动优选 IP） | 600 |
| blog | CNAME | 境外 | fallback.yourdomain.com | 600 |

TTL 建议设为 600（10 分钟），方便 IP 变更后快速生效。

阿里云 DNS 的操作类似，在添加记录时选择「解析线路」，支持按运营商、地区、国家细分。

> 每家运营商的最优 IP 不同，建议分别在电信、联通、移动的网络环境下各跑一次 CloudflareSpeedTest，将各自的最优 IP 填入对应线路。

### 方案三：优选域名（Cloudflare for SaaS）

优选 IP 的方案需要自己测速、自己维护 IP 列表。有没有一种方式，让别人的域名帮你完成优选？

这就是「优选域名」的思路：一些接入 Cloudflare 的大型网站（如 `visa.com`、`csgo.com`），其 DNS 解析出的 IP 在中国大陆方向有良好的路由。这些 IP 本质上也是 Cloudflare 的 Anycast IP——而前面说过，**任何 CF Anycast IP 都能代理所有 CF 上的域名**。

利用 Cloudflare for SaaS（原 SSL for SaaS）的 **Custom Hostname** 功能，可以让你的域名通过这些优选域名的 IP 接入 Cloudflare。

#### 步骤一：配置回退源（Fallback Origin）

这是告诉 Cloudflare「当有人通过优选 IP 访问我的域名时，去哪里拉取内容」。

1. 登录 Cloudflare Dashboard，选择你的域名
2. 进入 **DNS → Records**，添加一条 A 记录：

```
类型: A
名称: fallback（即 fallback.yourdomain.com）
IPv4 地址: 你源站的实际 IP
代理状态: 已代理（Proxied，橙色云朵）
```

3. 进入 **SSL/TLS → Custom Hostnames**，点击 **Add fallback origin**
4. 填入 `fallback.yourdomain.com`，保存
5. 等待状态变为 "Active"（通常几分钟，最长 24 小时）

#### 步骤二：添加自定义主机名

1. 在 **SSL/TLS → Custom Hostnames** 页面，点击 **Add Custom Hostname**
2. **Hostname**：填入你要优化的域名，如 `blog.example.com`
3. **SSL 证书类型**：选择验证方式——推荐 **TXT 验证**（无需开放源站 HTTP 端口）

添加后，Cloudflare 会生成两条 TXT 验证记录。

#### 步骤三：完成域名验证

在你**自定义主机名所在域名的 DNS 管理处**（不是 CF 面板），添加 Cloudflare 要求的 TXT 记录：

```
记录 1:
  类型: TXT
  名称: _acme-challenge.blog.example.com
  值: CF 提供的验证值

记录 2:
  类型: TXT
  名称: _cf-custom-hostname.blog.example.com
  值: CF 提供的验证值
```

添加后等待验证通过，Custom Hostname 的状态会变为 "Active"。之后 Cloudflare 会自动处理证书签发和续期。

#### 步骤四：配置分线路 DNS 解析

这是整个方案的关键一步。在你的域名 DNS 管理处（DNSPod / 阿里云 DNS 等），为自定义主机名配置 CNAME 解析：

**国内线路**——指向优选域名：

```
类型: CNAME
主机记录: blog
记录值: visa.com（或其他优选域名）
线路类型: 默认 / 国内
TTL: 600
```

**境外线路**——直接走 CF 标准路由：

```
类型: CNAME
主机记录: blog
记录值: fallback.yourdomain.com
线路类型: 境外 / 海外
TTL: 600
```

这样国内用户访问时，DNS 返回优选域名的 IP（即优质 CF 节点），流量经过该节点时 CF 通过 SNI 识别你的域名，从回退源拉取内容。海外用户则走 CF 默认的 Anycast 路由，不受影响。

#### 如何选择优选域名

社区验证过效果较好的优选域名（可能随时间失效，需自行验证）：

```text
visa.com
csgo.com
icook.hk
cdn.cloudflare.steamstatic.com
www.who.int
```

选择前先验证：

```bash
# 看延迟
ping -c 10 visa.com

# 看解析出的 IP
nslookup visa.com

# 用 CFST 直接测这个 IP 的速度
echo "解析到的IP" > test.txt
./CloudflareST -f test.txt -dd
```

不同网络环境下的最优域名不同，建议在自己的服务器上逐个测试后选择。

#### 验证配置是否生效

```bash
# 检查国内 DNS 解析（应返回优选域名的 IP）
nslookup blog.example.com 119.29.29.29

# 检查境外 DNS 解析（应返回 CF 标准 IP）
nslookup blog.example.com 8.8.8.8

# 测试 HTTPS 访问
curl -vI https://blog.example.com

# 检查 SSL 证书是否正确签发给你的域名
openssl s_client -connect blog.example.com:443 -servername blog.example.com 2>/dev/null | openssl x509 -noout -subject
```

### 方案对比

| 方案 | 适用场景 | 受益范围 | 分线路支持 | 维护成本 |
|------|----------|----------|-----------|---------|
| hosts | 个人调试 | 仅本机 | 无 | 几乎为零 |
| CNAME + 分线路 DNS | 面向国内用户的正式站点 | 所有访问者 | 支持 | 中（需定期重测 IP） |
| 优选域名（SaaS） | 希望低维护的正式站点 | 所有访问者 | 支持 | 低（定期验证域名即可） |
| 自动化脚本 | 对可用性有要求的站点 | 所有访问者 | 需自行实现 | 初期高，后期低 |

### 自动化：让优选持续生效

优选 IP 不是一劳永逸的——网络状况会变化，CF 也可能调整路由。生产环境建议做自动化。

**思路**：定时运行 CloudflareSpeedTest → 提取最优 IP → 通过 DNS API 更新记录。

```bash
#!/bin/bash
# cf-auto-optimize.sh — 自动测速并更新 DNS 记录

CFST_PATH="/opt/CloudflareSpeedTest"
DP_ID="your_dnspod_id"
DP_TOKEN="your_dnspod_token"
DOMAIN="blog.yourdomain.com"
DOMAIN_ID="your_dnspod_domain_id"

# 运行测速
cd "$CFST_PATH"
./CloudflareST -n 200 -t 10 -tl 200 -sl 3 -p 1 -o result.csv

# 提取最优 IP
BEST_IP=$(sed -n '2p' result.csv | awk -F ', ' '{print $1}')

if [ -z "$BEST_IP" ]; then
    echo "$(date): 未找到符合条件的 IP" >> /var/log/cf-optimize.log
    exit 1
fi

echo "$(date): 最优 IP: $BEST_IP" >> /var/log/cf-optimize.log

# 通过 DNSPod API 更新记录
curl -s -X POST https://dnsapi.cn/Record.Modify \
    -d "login_token=${DP_ID},${DP_TOKEN}&format=json" \
    -d "domain_id=${DOMAIN_ID}&record_id=${RECORD_ID}" \
    -d "sub_domain=blog&record_type=A&record_line_id=0&value=${BEST_IP}"
```

配合 cron 定时执行：

```cron
# 每 6 小时执行一次
0 */6 * * * /opt/scripts/cf-auto-optimize.sh
```

社区也有现成的自动化项目，比如 [dnspod-yxip](https://github.com/woodchen-ink/dnspod-yxip) 封装了完整的「测速 → 分线路 → 更新 DNSPod」流程，支持 Docker 一键部署。

> 如果使用的是 Cloudflare NS 接入而非第三方 DNS，直接通过 API 修改 A 记录的 IP 可能导致代理状态异常。这种场景更适合使用方案三（优选域名），或迁移到 CNAME 接入。

## 需要注意的事

域名优选是实用的优化手段，但有几个要点值得了解：

**IP 不是永久有效的。** Cloudflare 的路由策略会调整，运营商的互联状况也在变化。上周最快的 IP 这周可能就不快了。定期重新测速是必要的。

**不要公开分享具体 IP。** 某一个 IP 对你快，是因为走的人少。一旦公开，流量涌入，速度必然下降。这也是为什么本文不会列出任何具体的优选 IP。

**Cloudflare 官方的态度。** 优选 IP 本身并不违反 Cloudflare 的服务条款——你只是在访问 Cloudflare 公开的 Anycast IP。但如果因为大量用户共用同一个 IP 导致该节点异常，CF 可能会进行流量调度。这不是「被封」，而是 Anycast 网络的自我保护机制。

**不是所有场景都需要优选。** 如果你的站点面向全球用户且访问者不集中在特定地区，Cloudflare 默认的 Anycast 路由已经做得足够好。优选主要解决的是特定网络环境下的路由不理想问题——最典型的就是中国大陆访问境外 Cloudflare 站点的场景。

## 小结

Cloudflare 域名优选本质上是一件很简单的事：**在所有可用的 Cloudflare IP 中，找出对你最快的那个，然后让 DNS 指向它。**

背后的原理不复杂——Anycast 网络的特性决定了所有 IP 都能代理所有域名，BGP 路由的局限性决定了默认路径不一定最优。理解了这两点，优选的思路就水到渠成。

工具和方法都是现成的。真正需要投入的是持续的维护——网络在变，优选 IP 也需要跟着变。如果你的站点对访问速度有较高要求，把它纳入日常运维流程是值得的。

毕竟，路不止一条，选最快的走。

—— 智子
