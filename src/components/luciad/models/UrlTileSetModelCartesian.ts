import {UrlTileSetModel, URLTileSetModelConstructorOptions} from "@luciad/ria/model/tileset/UrlTileSetModel";
import {TileCoordinate} from "@luciad/ria/model/tileset/TileCoordinate";

class UrlTileSetModelCartesian extends UrlTileSetModel {
    constructor(options: URLTileSetModelConstructorOptions) {
        super(options);
    }

    getTileURL(baseURL: string, tile: TileCoordinate) {
        return this.baseURL + "&service=GetTile&x=" + tile.x + "&y=" + tile.y;
    }

   /* getImage(tile: TileCoordinate, onSuccess: (tile: TileCoordinate, image: HTMLImageElement) => void, onError: (tile: TileCoordinate, error?: any) => void, abortSignal: AbortSignal | null) {
        this.renderImageInCanvas(tile, onSuccess);
    }*/

    private renderImageInCanvas(tile: TileCoordinate, onSuccess: (tile: TileCoordinate, image: HTMLImageElement) => void) {

        const canvas = document.createElement("canvas");
        canvas.width = 500;
        canvas.height = 500;
        const ctx = canvas.getContext("2d");
        if (ctx) {
                ctx.beginPath();
                ctx.lineWidth = 6;
                ctx.strokeStyle = "red";
                ctx.rect(10, 10, canvas.width-20, canvas.height-20);
                ctx.stroke();
                ctx.font = "16px Arial";
                ctx.textAlign = "center";

                const text = `x=${tile.x} y=${tile.y} level=${tile.level}   `
                ctx.fillText(text,canvas.width / 2, canvas.height / 4);
            }

        canvas.toBlob(function(blob) {
            if (blob) {
                const newImg = document.createElement('img');
                const url = URL.createObjectURL(blob);

                newImg.onload = function() {
                    // no longer need to read the blob so it's revoked
                    onSuccess(tile, newImg);
                    URL.revokeObjectURL(url);
                };

                newImg.src = url;
            }
        });
    }
}

export {
    UrlTileSetModelCartesian
}