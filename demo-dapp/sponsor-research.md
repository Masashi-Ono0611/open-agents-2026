# ETHGlobal Open Agents — スポンサー調査レポート

**総賞金:** $50,000+ (スポンサー $35,000 + ETHGlobal pool)

---

## 1. 0G (Zero Gravity) — $15,000 【最大スポンサー】

### 概要
分散型AI インフラネットワーク。「AIエージェントのためのOS」として3層を提供:
- **0G Storage**: 分散ファイル/Blobストレージ（AIモデル重みやエージェントメモリ向け）
- **0G DA**: 高スループットデータAvailabilityレイヤー（50GB/s目標）
- **0G Compute**: 分散GPU/CPUコンピュートマーケットプレイス
- **0G Chain**: EVM互換L1（CosmosSDK + Ethermint）、Chain ID: 16600 (Newton testnet)

### 開発者ツール
```
npm install @0glabs/0g-ts-sdk
```
```typescript
// ファイルアップロード
const file = await ZgFile.fromFilePath("./weights.bin");
const tx = await indexer.upload(file, rpc, signer);

// KV Store（エージェントメモリ）
const kv = new KVStore(client);
await kv.set(streamId, key, value);
```
- RPC: `https://evmrpc-testnet.0g.ai`
- Faucet: `faucet.0g.ai`
- Docs: `docs.0g.ai`

### ERC-7857 (iNFT標準)
NFTにAIエージェントのモデル重み + メモリ + 所有権を内包する標準:
```solidity
interface IERC7857 {
    function agentModel(uint256 tokenId) external view returns (bytes32 modelCommitment);
    function memoryCapsule(uint256 tokenId) external view returns (address kvStore, bytes32 streamId);
    function transferWithMemory(address to, uint256 tokenId) external;
}
```

### 2トラック
- **Track A** ($7,500): エージェントフレームワーク・ツーリング・Core拡張
- **Track B** ($7,500): 自律エージェント・Swarm・iNFT実装 (ERC-7857)

### 必須要件
- コントラクトアドレス公開
- GitHub repo公開
- デモ動画 (3分以内)
- Telegram & X連絡先

### 勝ち筋
**「譲渡可能メモリ付きiNFT Agentスウォーム」**
- 各エージェント = ERC-7857 iNFT (0G Chain上)
- モデル重み → 0G Storage
- ワーキングメモリ → 0G KV Store
- NFT譲渡時に新オーナーがメモリを引き継ぎ
- Track A + Track B両方に同時申請可能

---

## 2. Uniswap Foundation — $5,000

### 概要
Uniswap v4 hooks + Universal Router + Permit2を使ったエージェントDeFi統合。
**必須**: `FEEDBACK.md`（DX摩擦・バグ・ドキュメント不足を記録）

### 主要パッケージ
| パッケージ | 用途 |
|----------|------|
| `@uniswap/v4-sdk` | v4スワップ/LP calldata構築 |
| `@uniswap/v4-core` | ABI + PoolManager型定義 |
| `@uniswap/universal-router` | スワップ実行エントリポイント |
| `@uniswap/permit2` | 署名ベーストークン承認 |
| `@uniswap/smart-order-router` | 自前ルーティングエンジン |

### Routing API
```
GET https://api.uniswap.org/v2/quote
  ?tokenInAddress=0x...
  &tokenOutAddress=0x...
  &amount=1000000
  &type=exactIn
  &protocols=v2,v3,v4
```

### v4 Hooksの仕組み
8つのライフサイクルコールバック (`beforeSwap`, `afterSwap`, etc.)。
エージェント活用例:
- afterSwapでLP自動リバランス
- beforeSwapで動的手数料調整（ボラティリティ連動）
- TWAMM hookで大口注文を分割実行

### MEV対策
- Flashbots Protect RPC: `https://rpc.flashbots.net`（RPCエンドポイント切り替えのみ）

### 勝ち筋
**DeFiポートフォリオエージェント**:
1. Routing API → 最適ルート取得
2. Permit2で承認 → Universal Routerで実行
3. v4 hookでアクション記録（透明性）
4. 自然言語 → スワップ実行

### FEEDBACK.md（$500ボーナス獲得のコツ）
- 具体的なエラーメッセージと再現手順を記録
- Rate limitに当たった時刻・入力値を記載
- v4 SDKドキュメントで詰まった箇所を列挙
- 「何を検索したか」も書く（ドキュメントの発見性問題）

---

## 3. Gensyn — $5,000

### 概要
分散型ML計算ネットワーク。**AXL (Agent eXchange Layer)** = P2Pエージェント通信プロトコル。
中央ブローカーなしでエージェント間のメッセージ/タスク交換を実現。

### 技術スタック
- トランスポート: **libp2p** (Gensyn RL Swarmと同スタック)
- メッセージング: GossipSub (pub/sub)
- ノード発見: mDNS (ローカル) + Kademlia DHT (広域)
- SDK: Python中心（TypeScript bindingの可能性あり）

### 必須要件
- **別々のAXLノードでの通信を実証** (同一プロセス内は不可)
- 中央メッセージブローカーを使わない
- Dockerコンテナ2つで別ノードを満たせる

```bash
# 最小構成（2コンテナ）
docker run gensyn/axl-node --port=8001  # Node A
docker run gensyn/axl-node --port=8002 --bootstrap=.../Node-A  # Node B
```

### 勝ち筋
**マルチエージェント研究チーム**（24-48h以内に実装可能）:
- 検索エージェント・コード実行エージェント・統合エージェントが各AXLノードで動作
- AXLのP2P pub/subでタスクを分散
- `docker ps`で2コンテナが別ノードとして動いている様子をデモ動画に入れる

**注意**: 全優勝チームがGensyn Foundationグラントプログラムに推薦される。

---

## 4. ENS — $5,000

### 概要
AIエージェントのオンチェーンアイデンティティ。ENS名でエージェントを識別・発見・認証。

### 2トラック
- **Best ENS Integration for AI Agents** ($2,500): 実際にENSが機能する統合
- **Most Creative Use of ENS** ($2,500): 資格情報ストレージ・プライバシー・クロスチェーンIDなど

### 主要ツール
```
npm install @ensdomains/ensjs viem
```

```typescript
// viem組み込み（依存ゼロ）
const addr = await getEnsAddress(client, { name: 'agent-42.myfleet.eth' })
const endpoint = await getEnsText(client, { name: 'agent-42.myfleet.eth', key: 'agent.endpoint' })
```

### エージェント用テキストレコード（推奨キー）
```
agent.capabilities  →  "search,code,finance"
agent.model         →  "claude-3-5-sonnet"
agent.endpoint      →  "https://api.example.com/agent/42"
agent.pubkey        →  "0x..." (署名公開鍵)
agent.schema        →  OpenAPI JSONのURL
```

### CCIP-Read（オフチェーンサブドメイン）
EIP-3668によりガスゼロでサブドメインを発行可能:
- `myagent.myfleet.eth` を1リクエストで即座に登録
- Cloudflare Workersで実装可能（実質無料・スケーラブル）

### NameWrapper（ERC-1155）
- サブドメインをNFTとして発行（エージェント資格証明）
- Fuse（権限フラグ）で制限設定
- 有効期限付きサブドメイン（時限エージェント資格）

### 勝ち筋
**ENSネイティブエージェントレジストリ（Track 1）**:
- `agents.eth` をCCIP-Readリゾルバで構築
- ガス不要のエージェント登録
- エージェントがENSテキストレコードで他エージェントを自律発見
- NameWrapperで資格NFT発行・失効

**ZK資格証明（Track 2）**:
- 安全性評価合格をENSテキストレコードに保存
- ZK証明で発行者の秘密鍵を開示せずオンチェーン検証

---

## 5. KeeperHub — $5,000

### 概要
オンチェーン自動実行レイヤー（keeper型ネットワーク）。
**注意**: WebSearchが使えず詳細情報が取得できなかった。公式ドキュメントを要確認。

### 類似サービスとの比較（参考）
Chainlink Keepers / Gelato Networkと同カテゴリ:
- off-chainボットがオンチェーン条件を監視し条件充足時に実行
- 典型ユースケース: 自動清算・DEXリバランス・スケジュール実行

### $500フィードバックボーナス（ほぼ確実に取れる）
KeeperHubを統合しさえすれば申請可能。構造化フィードバック:
- UXの摩擦点
- ドキュメントのギャップ
- バグ（具体的な再現手順付き）
- 欲しい機能

### 勝ち筋（予想）
AIエージェントのスケジューラとしてKeeperHubを使用:
- エージェントが自然言語でオンチェーンタスクをスケジュール登録
- KeeperHubが条件充足時に自動実行
- 「payment rails」はクロスチェーンブリッジ + 決済統合を指す可能性大

---

## トラック選択戦略（prizes.mdより）

- **最大3トラック**まで申請可能
- **0G + Gensyn**: マルチエージェントフレームワーク + P2P通信で相性◎
- **Uniswap + ENS**: オンチェーンIDアイデンティティ + DeFi実行で相性◎
- **KeeperHubフィードバックボーナス**: KeeperHubを少し使うだけで$250～$500ほぼ確実
- Uniswapは`FEEDBACK.md`必須 → 時間を確保すること
- Gensynは別ノードAXL通信必須 → インフラ設計を事前に計画すること

---

## おすすめの組み合わせ（24-48hハッカソン想定）

### パターンA: フルスタックAIエージェント ($最大$27,500)
0G Track B + Uniswap + ENS:
- ENS名付きiNFTエージェントが、Uniswapでポートフォリオを管理
- 資産判断ロジックと実行履歴を0G KV Storeに保存
- ENSテキストレコードでエージェント能力を公開

### パターンB: インフラフォーカス ($最大$17,500)
0G Track A + Gensyn:
- 0G上で動くエージェントフレームワーク
- AXLでエージェント間P2P通信
- iNFT対応メモリ管理レイヤー

### 最低限取りにいく賞
- KeeperHubフィードバックボーナス ($250-500): 統合するだけ
- Uniswap FEEDBACK.md ($500): ちゃんと書けばほぼ取れる
