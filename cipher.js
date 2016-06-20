// short hand for logging
const log = txt => console.log(txt);

// some field accessors
const secretInput = document.getElementById('secret');
const bookInput = document.getElementById('book');

// getters/setters for en-/decode fields
const getDecoded = () => {
  if (document.getElementById('decoded')) {
    return document.getElementById('decoded').innerHTML;
  } else {
    return '';
  }
};
const setDecoded = (val) => {
  document.getElementById('decoded').innerHTML = val;
  log('Setting decode to ' + val + '.');
};

const getEncoded = () => {
  if (document.getElementById('encoded')) {
    return document.getElementById('encoded').innerHTML;
  } else {
    return '';
  }
};
const setEncoded = (val) => {
  document.getElementById('encoded').innerHTML = val;
  log('Setting encode to ' + val + '.');
};




// helper functions
const valueFromEvent = event => event.target.value;

const allowedCharacters = character => '. '.indexOf(character) === -1;

// element to observable
const observableElement = (element) => {
  return Rx.Observable.fromEvent(element, 'input')
    .map(valueFromEvent)
    .debounce(150);
};

// inputs as observables: 
const secret$ = observableElement(secretInput);
const book$ = observableElement(bookInput);

const inputs$ = Rx.Observable.combineLatest(
  observableElement(secretInput),
  observableElement(bookInput)
);



// current encode/decode maps
var encodeMap; // unnecesary!:O
var decodeMap; // unnecesary!



// the encodeMap has type Character => [Number]
var createEncodeMap = (text) => {

  var buildEncodeMap = (map, character, idx) => {
    var cipher = [idx];
    if (map.has(character)) {
      cipher = cipher.concat(map.get(character));
    }
    return map.set(character.toLowerCase(), cipher);
  };

  Rx.Observable
    .from(text)
    .where(allowedCharacters)
    .reduce(buildEncodeMap, new Map())
    .subscribe((map) => { encodeMap = map });
};

// the decodeMap has type Number => Character
var createDecodeMap = (text) => {

  var buildDecodeMap = (map, character, idx) => { return map.set(idx, character) };

  Rx.Observable
    .from(text)
    .where(allowedCharacters)
    .reduce(buildDecodeMap, new Map())
    .subscribe(it => { decodeMap = it });
};


var encode = (text, map) => {
  if (!text) {
    log('No text to encode, resultung to default.');
    text = secretInput.value;
  }
  if (!map) {
    log('No map to encode, resorting to default.');
    map = encodeMap;
  }

  var safeEncodeCharacter = (character, map) => {
    var key = character.toLowerCase();
    if (map.has(key)) {
      var list = map.get(key);
      var idx = Math.round(Math.random() * (list.length - 1));
      return list[idx];
    } else {
      return character;
    }
  };

  var result;
  Rx.Observable
    .from(text)
    .map(c => safeEncodeCharacter(c, encodeMap))
    .reduce((string, cipher) => { return string + ' ' + cipher; }, '')
    .subscribe(code => {
      setEncoded(code);
      result = code;
    });
  return result;
};





var decode = (code, map) => {
  if (!code) {
    log('No code to decode, resorting to default.');
    code = getEncoded();
  }
  if (!map) {
    log('No map to decode, resorting to default.');
    map = decodeMap;
  }

  const safeDecodeCipher = (cipher, decodeMap) => {
    var key = parseInt(cipher);
    if (decodeMap.has(key)) {
      log(key + ' ' + decodeMap.get(key));
      return decodeMap.get(key);
    } else {
      return cipher;
    }
  };

  //var result;
  var ciphers = code.split(' ');

  Rx.Observable
    .from(ciphers)
    .filter((cipher) => { return cipher !== '' })
    .map((cipher) => safeDecodeCipher(cipher, map))
    .reduce((string, character) => { return string + character; }, '')
    .subscribe(decodedString => { setDecoded(decodedString); });
};




var createMaps = (txt) => {
  var book = txt;
  if (!txt) {
    book = bookInput.value;
  }
  createEncodeMap(book);
  createDecodeMap(book);
};


// 0.0 couple encoding to observable secret/book
var watchSecret = function () {
  secret$.subscribe((txt) => {
    encode(txt, encodeMap);
    decode(document.getElementById('encoded').innerHTML, decodeMap);

  });
};

// 0.0 couple decoding to observable encoding
var watchBook = function () {
  book$.subscribe((book) => { createMaps(book); });
};

(function () {
  createMaps();
  encode();
  decode();

  book$.subscribe((book) => { createMaps(book); });

  secret$.subscribe((txt) => {
    encode(txt, encodeMap);
    decode(document.getElementById('encoded').innerHTML, decodeMap);

  });
})();

// extra ideas:
// do something with &nbsp; instead of spaces.
// reduce all the things!
// combineLatest van twee inputs -> scan om input strings per character te verwerken