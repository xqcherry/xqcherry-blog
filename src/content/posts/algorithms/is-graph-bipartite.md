---
title: 785. 判断二分图：DFS 染色与冲突检测
published: 2026-09-20
description: 将相邻顶点染成不同颜色；一旦边的两端颜色相同，图就不是二分图。
tags: [图, DFS]
category: 算法题解
draft: false
---

二分图的顶点可以分成两个集合，任意边只连接不同集合。把两个集合抽象为 `0` 与 `1` 两种颜色，就得到 DFS/BFS 染色问题。

```
class Solution {
public:

    vector<int> color;
    vector<vector<int>> graphs;

    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        graphs = graph;

        color.assign(n, -1);

        for(int i = 0; i < n; i ++ ) {
            if(color[i] == -1) {
                if(!dfs(i, 0)) return 0;
            }
        }

        return 1;
    }

    int dfs(int u, int c) {
        color[u] = c;

        for(auto& v : graphs[u]) {
            if(color[v] == -1) {
                if(!dfs(v, 1 - c)) return 0;
            }
            else if(color[v] == color[u]) {
                return 0;
            }
        }

        return 1;
    }
};
```

图可能不连通，不能只从 `0` 号节点开始。每个未染色节点都应作为一个新连通分量的起点。时间复杂度为 $O(V+E)$，空间复杂度为 $O(V)$。
