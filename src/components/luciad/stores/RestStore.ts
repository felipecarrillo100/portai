import {Store} from "@luciad/ria/model/store/Store";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Cursor} from "@luciad/ria/model/Cursor";
import {GeoJsonCodec} from "@luciad/ria/model/codec/GeoJsonCodec";

interface RestStoreOptions {
    url: string;
}

class RestStore implements Store {
    private url: string;
    private static codec = new GeoJsonCodec();

    constructor(options: RestStoreOptions) {
        this.url = options.url;
    }

    query(query?: (feature: Feature) => boolean): Cursor | Promise<Cursor> {
        return new Promise<Cursor>(resolve=>{
            fetch(this.url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.text();
                })
                .then(content => {
                    const cursor = RestStore.codec.decode({content, contentType:"application/json"})
                    resolve(cursor);
                })
                .catch(function () {
                    const content = "{}";
                    const cursor = RestStore.codec.decode({content, contentType:"application/json"})
                    resolve(cursor);
                })
        })
    }
}

export {
    RestStore
}