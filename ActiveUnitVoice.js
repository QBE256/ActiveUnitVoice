/*
マップでユニット選択時にボイスを流す ver1.0

■作成者
キュウブ

■概要
マップでユニットを選択した時にボイスが流れるようになります。
対象ユニットのHP25%以下、HP50%以下、HP50%より大きい時で別のボイスを流す事ができます。

■使い方
1.通常通りにコンフィグでボイス設定をします。
2.ユニットごとに以下のようなカスパラを設定してボイスファイルを設定します。
activeVoice: {
	full: 'HP50%超過時に流れるボイスのファイル名',
	half: 'HPが25%より大きくかつ50%以下時に流れるボイスのファイル名',
	quarter: 'HP25%以下の時に流れるボイスのファイル名'
}

例1:下記の場合は現在HPに応じて、sample1.ogg,sample2.ogg,sample3.oggが流れます
activeVoice: {
	full: 'sample1.ogg',
	half: 'sample2.ogg',
	quarter: 'sample3.ogg'
}

例2:下記の場合はHPがどんな値であってもsample1.oggが流れます
activeVoice: {
	full: 'sample1.ogg',
	half: 'sample1.ogg',
	quarter: 'sample1.ogg'
}

例3:下記の場合はHPが50%以下になるとボイスが流れません
activeVoice: {
	full: 'sample1.ogg'
}

■更新履歴
ver 1.0 (2020/08/30)
初版公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
*/

PlayerTurn._moveMap = function() {
	var result = this._mapEdit.moveMapEdit();
		
	if (result === MapEditResult.UNITSELECT) {
		this._targetUnit = this._mapEdit.getEditTarget();
		if (this._targetUnit !== null) {
			if (this._targetUnit.isWait()) {
				this._mapEdit.clearRange();
					
				// 待機しているユニット上での決定キー押下は、マップコマンドとして扱う
				this._mapCommandManager.openListCommandManager();
				this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
			}
			else {
				// ユニットの移動範囲を表示するモードに進む
				this._mapSequenceArea.openSequence(this);
				this._playActiveUnitVoice();
				this.changeCycleMode(PlayerTurnMode.AREA);
			}
		}
	}
	else if (result === MapEditResult.MAPCHIPSELECT) {
		this._mapCommandManager.openListCommandManager();
		this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
	}
		
	return MoveResult.CONTINUE;
};

PlayerTurn._playActiveUnitVoice = function() {
	var fileName;
	var hpRate = 1;
	var voiceId = 1;

	if (!this._targetUnit) {
		return;
	}

	if (!('activeVoice' in this._targetUnit.custom)) {
		return;
	}

	hpRate = this._targetUnit.getHp() / ParamBonus.getMhp(this._targetUnit);

	if (hpRate > 0.5  && ('full' in this._targetUnit.custom.activeVoice)) {
		fileName = this._targetUnit.custom.activeVoice.full;
	}
	else if (hpRate > 0.25 && hpRate <= 0.5 && ('half' in this._targetUnit.custom.activeVoice)) {
		fileName = this._targetUnit.custom.activeVoice.half;
	}
	else if (hpRate <= 0.25 && ('quarter' in this._targetUnit.custom.activeVoice)) {
		fileName = this._targetUnit.custom.activeVoice.quarter;
	}
	else {
		return;
	}

	// ボイスを流す前に別のボイスが流れている場合は止める
	root.getMaterialManager().voiceStop(voiceId, false);

	root.getMaterialManager().voicePlay(DataConfig.getVoiceCategoryName(), fileName, voiceId);
};