import * as admin from 'firebase-admin'
import { ServiceAccount } from 'firebase-admin'

import serviceAccount from "../../lib/credentials.json"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: "https://price-tracker-1c428.firebaseio.com",
})

export const db = admin.database()