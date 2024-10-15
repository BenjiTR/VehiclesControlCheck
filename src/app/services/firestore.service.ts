import { Injectable } from "@angular/core";
import { doc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  private db = getFirestore(); // Asegúrate de inicializar la base de datos correctamente

  constructor() {}

  async getDocument(collection: string, documentId: string) {
    try {
      const docRef = doc(this.db, collection, documentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        //console.log("Document data:", docSnap.data());
        return docSnap.data();
      } else {
        //console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }
}
