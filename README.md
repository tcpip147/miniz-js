# Miniz JS

miniz.c 라이브러리를 WebAssembly를 이용하여 JS로 포팅 하였습니다

속도는 JS보다 3~4배 정도 빨라진거 같습니다

### 예제

```
const files = [];
for (let i = 0; i < 10; i++) {
  files.push({
    name: `file${i}.txt`,
    data: `Hello World${i}`,
  });
}

const miniz = new Miniz();
miniz.zip(files).then((compressed) => {
  miniz.unzip(compressed).then((uncompressed) => {
    console.log(uncompressed);
  });
});
```
