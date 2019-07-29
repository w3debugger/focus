class LocalStorage {
  setItem(key, value){
    localStorage.setItem(key, value);
  }

  getItem(key, defaultValue) {
    return localStorage.getItem(key) || defaultValue;
  }

  deleteItem(key) {
    return localStorage.deleteItem(key);
  }
}
