emcc src/c/miniz.c src/c/script.c -o public/miniz.js -O2 ^
-D IMPORT_EMSCRIPTEN_HEADER ^
--emit-tsd miniz.d.ts ^
-sMAIN_MODULE=0 ^
-sALLOW_MEMORY_GROWTH ^
-sMODULARIZE ^
-sENVIRONMENT=web ^
-sEXPORTED_RUNTIME_METHODS=stringToUTF8,UTF8ToString,setValue,getValue ^
-sEXPORTED_FUNCTIONS=_malloc,_free,_size_of_pointer,_size_of_size_t,_c_zip,_c_unzip