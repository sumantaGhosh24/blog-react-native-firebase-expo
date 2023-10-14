import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

import {storage} from "./firebase";

export const uploadImage = async (file) => {
  try {
    const response = await fetch(file);
    const blob = await response.blob();
    const storageRef = ref(storage, "user-" + new Date().getTime());
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};
