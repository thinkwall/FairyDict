// Generated by CoffeeScript 1.10.0
define(["jquery", "utils", "background/setting", "background/dict.js", "background/storage"], function($, utils, setting, dict, storage) {
  var dictWindowManager;
  console.log("[dictwindow] init");
  dictWindowManager = {
    w: null,
    defaultWidth: 620,
    defaultHeight: 700,
    open: function() {
      var dfd, left, top;
      dfd = $.Deferred();
      left = (screen.width / 2) - (dictWindowManager.defaultWidth / 2);
      top = (screen.height / 2) - (dictWindowManager.defaultHeight / 2);
      if (!this.w) {
        chrome.windows.create({
          url: chrome.extension.getURL('dict.html'),
          type: 'popup',
          width: dictWindowManager.defaultWidth,
          height: dictWindowManager.defaultHeight,
          left: left,
          top: top
        }, function(win) {
          dictWindowManager.w = win;
          return setTimeout((function() {
            return dfd.resolve();
          }), 500);
        });
      } else {
        chrome.windows.update(dictWindowManager.w.id, {
          focused: true
        });
        dfd.resolve();
      }
      return dfd;
    },
    sendMessage: function(msg) {
      var tid;
      if (this.w) {
        tid = this.w.tabs[0].id;
        return chrome.tabs.sendMessage(tid, msg);
      }
    },
    lookup: function(text) {
      var dictName, queryId;
      dictName = setting.getValue('dictionary');
      queryId = Date.now();
      return this.open().done((function(_this) {
        return function() {
          var inHistory;
          if (text) {
            _this.sendMessage({
              type: 'querying',
              text: text,
              queryId: queryId
            });
            inHistory = false;
            if (storage.history[storage.history.length - 1] === text) {
              inHistory = true;
            }
            return _this.queryDict(text, dictName, queryId, inHistory);
          } else {
            return _this.sendMessage({
              type: 'history',
              history: storage.history
            });
          }
        };
      })(this));
    },
    queryDict: function(text, dictName, queryId, inHistory) {
      if (!inHistory) {
        this.sendMessage({
          type: 'history',
          history: storage.history
        });
      }
      return dict.query(text, dictName).then((function(_this) {
        return function(res) {
          if (text.split(/\s+/).length <= 5 && !inHistory) {
            storage.appendHistory(text);
          }
          console.log("[dictwindow] query " + text + " from " + dictName);
          return _this.sendMessage({
            type: 'queryResult',
            result: res,
            queryId: queryId
          });
        };
      })(this));
    }
  };
  chrome.windows.onRemoved.addListener(function(wid) {
    var ref;
    if (((ref = dictWindowManager.w) != null ? ref.id : void 0) === wid) {
      return dictWindowManager.w = null;
    }
  });
  return dictWindowManager;
});
