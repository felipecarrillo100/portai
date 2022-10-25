import {Store} from "@luciad/ria/model/store/Store";
import {Feature} from "@luciad/ria/model/feature/Feature";
import {Cursor} from "@luciad/ria/model/Cursor";
import {GeoJsonCodec} from "@luciad/ria/model/codec/GeoJsonCodec";
import {stringify} from "querystring";
import {CoordinateReference} from "@luciad/ria/reference/CoordinateReference";
import {EventedSupport} from "@luciad/ria/util/EventedSupport";

interface RestStoreOptions {
    url: string;
    reference?: CoordinateReference;
}

class FeaturesRestAPIStore extends EventedSupport implements Store {
    private url: string;
    private static codec = new GeoJsonCodec();
    private reference: CoordinateReference | undefined;

    constructor(options: RestStoreOptions) {
        super();
        this.url = options.url;
        this.reference = options.reference ? options.reference : undefined;
    }

    clear() {
        return new Promise<boolean>((resolve, reject)=>{
            this.query().then(cursor=>{
                const requestOptions: RequestInit = {
                    method: 'DELETE',
                    headers: {},
                    redirect: 'follow'
                };

                const request = this.url;
                fetch(request, requestOptions)
                    .then(response => {
                        if (response.status===200) {
                            while (cursor.hasNext()) {
                                const feature = cursor.next();
                                this.emit("StoreChanged", "remove", undefined, feature.id);
                            }
                            resolve(true);
                        } else reject();
                    })
                    .catch(error => {
                        console.log('error', error);
                        reject();
                    });
            })
        })
    }

    add(feature: Feature, options?: any) {
        return new Promise<number|string>((resolve, reject)=>{

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const geometry = FeaturesRestAPIStore.codec.encodeShape(feature.shape as any);

            const raw = JSON.stringify({
                "geometry": geometry,
                "properties": feature.properties
            });

            const requestOptions: RequestInit = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            const request = this.url ;
            fetch(request, requestOptions)
                .then(response => {
                    if (response.status===200) {
                        response.json().then((featureID)=>{
                            feature.id = featureID;
                            this.emit("StoreChanged",  "add", feature, featureID);
                            resolve(featureID);
                        })
                    } else reject();
                })
                .catch(error => {
                    console.log('error', error);
                    reject();
                });
        })
    }

    put(feature: Feature, options?: any){
        return new Promise<number|string>((resolve, reject)=>{

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const geometry = FeaturesRestAPIStore.codec.encodeShape(feature.shape as any);

            const raw = JSON.stringify({
                "id": feature.id,
                "geometry": geometry,
                "properties": feature.properties
            });

            const requestOptions: RequestInit = {
                method: 'PUT',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            const request = this.url;
            fetch(request, requestOptions)
                .then(response => {
                    if (response.status===200) {
                        response.json().then((featureID)=>{
                            this.emit("StoreChanged",  "update", feature, featureID);
                            resolve(featureID);
                        })
                    } else reject();
                })
                .catch(error => {
                    console.log('error', error);
                    reject();
                });
        })
    }

    get(id: number | string, option?: any) {
        return new Promise<Feature>((resolve, reject)=>{
            const requestOptions: RequestInit = {
                method: 'GET',
                headers: {},
                redirect: 'follow'
            };

            const request = this.url + "/" + id;
            fetch(request, requestOptions)
                .then(response => {
                    if (response.status===200) {
                        response.json().then((rawFeature)=>{
                            const feature = {
                                type: "Feature",
                                id: rawFeature.id,
                                geometry: rawFeature.geometry,
                                properties: rawFeature.properties
                            };

                            const cursorX = FeaturesRestAPIStore.codec.decode({content: JSON.stringify(feature), contentType:"application/json", reference: this.reference});
                            if (cursorX.hasNext()) {
                                const f = cursorX.next();
                                resolve(f)
                            } else {
                               reject()
                            }
                        })
                    } else reject();
                })
                .catch(error => {
                    console.log('error', error);
                    reject();
                });
        })
    }

    remove(id: number | string) {
        return new Promise<boolean>((resolve, reject)=>{
            const requestOptions: RequestInit = {
                method: 'DELETE',
                headers: {},
                redirect: 'follow'
            };

            const request = this.url + "/" + id;
            fetch(request, requestOptions)
                .then(response => {
                    if (response.status===200) {
                        this.emit("StoreChanged", "remove", undefined, id);
                        resolve(true);
                    } else reject();
                })
                .catch(error => {
                    console.log('error', error);
                    reject();
                });
        })
    }

    query(query?: (feature: Feature) => boolean): Promise<Cursor> {
        return new Promise<Cursor>(resolve=>{
            fetch(this.url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                        const content = "{}";
                        const cursor = FeaturesRestAPIStore.codec.decode({content, contentType:"application/json"})
                        resolve(cursor);
                    }
                    return response.text();
                })
                .then(content => {
                    const features = JSON.parse(content).map((f: any)=>({
                        type: "Feature",
                        id: f.id,
                        geometry: f.geometry,
                        properties: f.properties
                    }));
                    const collection = {
                        type: "FeatureCollection",
                        features
                    }
                  //  console.log(collection);
                    const cursorX = FeaturesRestAPIStore.codec.decode({content: JSON.stringify(collection), contentType:"application/json", reference: this.reference})
                    resolve(cursorX);
                })
                .catch(function () {
                    const content = "{}";
                    const cursor = FeaturesRestAPIStore.codec.decode({content, contentType:"application/json"})
                    resolve(cursor);
                })
        })
    }
}

export {
    FeaturesRestAPIStore
}