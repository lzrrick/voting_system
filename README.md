# a decentralized voting system 去中心化的投票系统

**主要依赖：**

1. 后端：solidity hardhat
2. 前端：nextjs moralis web3uikit

**本地运行方法：**

1. cd voting_backend / yarn install 安装后端依赖 
2. hardhat node 运行本地区块链节点并部署智能合约
3. cd voting_frontend / npm install 安装前端依赖
4. npm run dev 运行前端页面

**效果图：**

**问题：**

1. 本地存储所有数据
2. react-moralis 使用 useWeb3Contract 方法不能直接获取合约函数返回的结构体变量及其数组，本项目将不能返回的变量转换成 json 字符串结构返回。

**解决办法：**

1. 使用 the graph 存储和查询数据（todo）
