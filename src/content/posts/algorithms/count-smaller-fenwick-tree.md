---
title: 315. 计算右侧小于当前元素的个数：离散化与树状数组
published: 2026-09-20
description: 从右向左扫描数组，用离散化压缩值域，并通过树状数组查询右侧较小元素的数量。
tags: [数组]
category: 算法题解
draft: false
---

处理 `nums[i]` 时，右侧元素已经加入数据结构；问题变成查询“已加入元素中有多少值小于 `nums[i]`”。值域可能很大或包含负数，所以先离散化为连续排名。

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 1e5 + 10;

int n;
int a[N], tree[N];

int lowbit(int x) {
    return x & -x;
}

void add(int x, int v) {
    while(x <= n) {
        tree[x] += v;
        x += lowbit(x);
    }
}

int query(int x) {
    int res = 0;

    while(x) {
        res += tree[x];
        x -= lowbit(x);
    }

    return res;
}

int main() {

    cin >> n;
    vector<int> alls, res;

    for(int i = 0; i < n; i ++ ) {
        cin >> a[i];
        alls.push_back(a[i]);
    }
        
    sort(alls.begin(), alls.end());
    alls.erase(unique(alls.begin(), alls.end()), alls.end());

    for(int i = n - 1; i >= 0; i -- ) {
        int rk = lower_bound(alls.begin(), alls.end(), a[i]) - alls.begin() + 1;

        res.push_back(query(rk - 1));
        add(rk, 1);
    }

    reverse(res.begin(), res.end());

    for(auto& x : res) cout << x << " ";

    return 0;
}
```

树状数组的 `query(rank - 1)` 正好排除与当前值相等的元素，符合“严格小于”的要求。排序离散化与每次查询/更新的总复杂度均为 $O(n\log n)$。
