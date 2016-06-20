const cipher$ = inputToStream('book')
    .map(contents => {
        const chars = contents.split('');

        return chars.reduce(({encodeCipher, decodeCipher}, currentChar, charPosition) => {
            let possibleValues = encodeCipher.get(currentChar) || [];
            possibleValues.push(charPosition);
            encodeCipher.set(currentChar, possibleValues);

            decodeCipher.set(charPosition, currentChar);

            return { encodeCipher, decodeCipher };
        }, { encodeCipher: new Map(), decodeCipher: new Map() });
    });


const secret$ = inputToStream('secret');

secret$
.combineLatest(cipher$)
.subscribe(([secret, { encodeCipher, decodeCipher }]) => {
    const encoded = encode(secret, encodeCipher);
    document.getElementById('encoded').innerHTML = encoded;
    document.getElementById('decoded').innerHTML = decode(encoded, decodeCipher);
});

// Helper functions:

function inputToStream(inputId){
    return Rx.Observable.fromEvent(document.getElementById(inputId), 'input')
        .map(ev => ev.target.value)
        .startWith(document.getElementById(inputId).value);
}

function getRandomValue(sourceArray){
    return sourceArray[Math.floor(Math.random() * sourceArray.length)];
}

function encode(text, encodeCipher){
    return text
        .split('')
        .filter(char => encodeCipher.has(char))
        .reduce(
            (soFar, currentChar) => {
                return soFar + ' ' + getRandomValue(encodeCipher.get(currentChar));
            },
            ''
        );
}

function decode(text, decodeCipher){
    return text
        .split(' ')
        .filter(char => char.length > 0)
        .reduce(
            (soFar, currentChar) => {
                return soFar + decodeCipher.get(parseInt(currentChar, 10));
            },
            ''
        );
}
