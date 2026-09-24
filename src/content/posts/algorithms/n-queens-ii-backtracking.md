---
title: 52. N 皇后 II：回溯与方向检查
published: 2026-09-18
description: 逐行放置皇后，在已有棋盘中检查同列和两条对角线是否冲突，统计所有合法布局。
tags: [回溯, DFS, 剪枝]
category: 算法题解
draft: false
---

每一行只能放一个皇后，因此递归的第 `row` 层只需尝试该行的各列。冲突只可能来自同列、主对角线或副对角线。

## 状态设计

由于按行递归，当前行之下尚未放置皇后。检查位置 `(r, c)` 时，只需向上检查同列、左上对角线和右上对角线。

```
#include<bits/stdc++.h>
using namespace std;

const int N = 10;

int n, res;
int g[N][N];

int check(int r, int c) {

    for(int i = r - 1; i >= 0; i --) {
        if(g[i][c] == 1) return 0;
    }

    for(int i = r - 1, j = c - 1; i >= 0 && j >= 0; i --, j --) {
        if(g[i][j] == 1) return 0;
    }

    for(int i = r - 1, j = c + 1; i >= 0 && j < n; i --, j ++) {
        if(g[i][j] == 1) return 0;
    }

    return 1;
}

void dfs(int r) {

    if(r == n) {
        res ++;
        return ;
    } 

    for(int c = 0; c < n; c ++ ) {
        if(check(r, c)) {
            g[r][c] = 1;
            dfs(r + 1);
            g[r][c] = -1;
        }
    }
}

int main() {

    cin >> n;

    for(int i = 0; i < n; i ++)
        for(int j = 0; j < n; j ++)
            g[i][j] = -1;

    dfs(0);

    cout << res << "\n";

    return res;
}
```

回溯最重要的是撤销状态；忘记恢复任一数组都会污染下一条搜索分支。搜索树最坏规模为 $O(n!)$，剪枝显著减少实际分支。
