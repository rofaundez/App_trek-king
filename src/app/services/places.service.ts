import { Injectable } from '@angular/core';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import Place from '../interface/place.interface';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private firestore: Firestore ) { }

  addPlace(place: Place) {
    const placeRef = collection(this.firestore, 'places');
    return addDoc(placeRef, place);
  }

};
