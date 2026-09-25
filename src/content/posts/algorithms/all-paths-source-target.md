---
title: LCR 110. 所有可能的路径：DFS 回溯枚举 DAG 路径
published: 2026-09-23
description: 在有向无环图中维护当前路径，深度优先搜索到终点时收集结果，并在返回时撤销选择。
tags: [图, DFS, 回溯]
category: 算法题解
draft: false
---

题目要求列出从节点 `0` 到节点 `n - 1` 的全部路径。图是 DAG，因此沿边递归不会遇到环；每次递归只需维护一条当前路径。

```cpp
class Solution {
public:
    vector<vector<int>> g, res;
    vector<int> path;
    int n ;

    vector<vector<int>> allPathsSourceTarget(vector<vector<int>>& graph) {

        g = graph;
        n = graph.size();

        path.push_back(0);
        dfs(0);

        return res;
    }

    void dfs(int u) {

        if(u == n - 1) {
            res.push_back(path);
            return ;
        }

        for(auto& v : g[u]) {
            path.push_back(v);
            dfs(v);
            path.pop_back();
        }
    }
};
```

## 回溯的关键

`push_back` 代表选择下一节点，递归返回后的 `pop_back` 代表撤销选择。遗漏撤销会让相邻分支共享错误路径。输出本身可能有指数级大小，因此总时间复杂度至少与答案规模成正比。
