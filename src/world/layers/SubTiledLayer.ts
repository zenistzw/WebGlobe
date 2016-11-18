///<amd-module name="world/layers/SubTiledLayer"/>
import Kernel = require('../Kernel');
import Utils = require('../Utils');
import MathUtils = require('../math/Math');
import TileGrid = require('../TileGrid');
import GraphicGroup = require('../GraphicGroup');
import Tile = require('../graphics/Tile');

class SubTiledLayer extends GraphicGroup {
  level: number = -1;
  tiledLayer: any = null;

  constructor(args: any) {
    super();
    this.level = args.level;
  }

  //重写GraphicGroup的draw方法
  // draw(camera: any) {
  //   /*if (this.level >= Kernel.TERRAIN_LEVEL && Kernel.globe && Kernel.globe.camera.pitch <= Kernel.TERRAIN_PITCH) {
  //     Kernel.gl.clear(Kernel.gl.DEPTH_BUFFER_BIT);
  //     Kernel.gl.clearDepth(1);
  //     Kernel.gl.enable(Kernel.gl.DEPTH_TEST);
  //   } else {
  //     Kernel.gl.disable(Kernel.gl.DEPTH_TEST);
  //   }*/
  //   Kernel.gl.disable(Kernel.gl.DEPTH_TEST);//此处禁用深度测试是为了解决两个不同层级的切片在拖动时一起渲染会导致屏闪的问题
  //   super.draw(camera);
  // }

  //重写GraphicGroup的add方法
  add(tile: Tile) {
    if (tile.tileInfo.level === this.level) {
      super.add(tile);
      tile.subTiledLayer = this;
    }
  }

  //重写GraphicGroup的destroy方法
  destroy() {
    super.destroy();
    this.tiledLayer = null;
  }

  //根据level、row、column查找tile，可以供调试用
  findTile(level: number, row: number, column: number) {
    var length = this.children.length;
    for (var i = 0; i < length; i++) {
      var tile = <Tile>this.children[i];
      if (tile.tileInfo.level === level && tile.tileInfo.row === row && tile.tileInfo.column === column) {
        return tile;
      }
    }
    return null;
  }

  //根据传入的tiles信息进行更新其children
  updateTiles(visibleTileGrids: TileGrid[], bAddNew: boolean) { //camera,options
    //var visibleTileGrids = camera.getVisibleTilesByLevel(this.level,options);
    //检查visibleTileGrids中是否存在指定的切片信息
    function checkTileExist(tileArray: TileGrid[], lev: number, row: number, col: number): any {
      var result = {
        isExist: false,
        index: -1
      };
      for (var m = 0; m < tileArray.length; m++) {
        var tileInfo = tileArray[m];
        if (tileInfo.level === lev && tileInfo.row === row && tileInfo.column === col) {
          result.isExist = true;
          result.index = m;
          return result;
        }
      }
      return result;
    }

    //记录应该删除的切片
    var tilesNeedDelete: Tile[] = [];
    var i:number, tile:Tile;
    for (i = 0; i < this.children.length; i++) {
      tile = <Tile>this.children[i];
      var checkResult = checkTileExist(visibleTileGrids, tile.tileInfo.level, tile.tileInfo.row, tile.tileInfo.column);
      var isExist = checkResult.isExist;
      if (isExist) {
        visibleTileGrids.splice(checkResult.index, 1); //已处理
      } else {
        //暂时不删除，先添加要删除的标记，循环删除容易出错
        tilesNeedDelete.push(tile);
      }
    }

    //集中进行删除
    while (tilesNeedDelete.length > 0) {
      var b = this.remove(tilesNeedDelete[0]);
      tilesNeedDelete.splice(0, 1);
      if (!b) {
        console.debug("subTiledLayer.remove(tilesNeedDelete[0])失败");
      }
    }

    if (bAddNew) {
      //添加新增的切片
      for (i = 0; i < visibleTileGrids.length; i++) {
        var tileGridInfo = visibleTileGrids[i];
        var args = {
          level: tileGridInfo.level,
          row: tileGridInfo.row,
          column: tileGridInfo.column,
          url: ""
        };
        args.url = this.tiledLayer.getImageUrl(args.level, args.row, args.column);
        tile = Tile.getTile(args.level, args.row, args.column, args.url);
        this.add(tile);
      }
    }
  }

  checkIfLoaded() {
    for (var i = 0; i < this.children.length; i++) {
      var tile = <Tile>this.children[i];
      if (tile) {
        var isTileLoaded = tile.material.isReady();
        if (!isTileLoaded) {
          return false;
        }
      }
    }
    return true;
  }
}

export = SubTiledLayer;