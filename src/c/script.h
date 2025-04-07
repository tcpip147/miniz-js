#include "miniz.h"

#ifdef IMPORT_EMSCRIPTEN_HEADER
#include <emscripten.h>
#endif

typedef struct
{
    char *name;
    char *data;
} FileEntry;

int size_of_pointer();

int size_of_size_t();

unsigned char *c_zip(FileEntry *files, size_t num_files, size_t *buf_size);

FileEntry *c_unzip(unsigned char *data, size_t buf_size, size_t *num_files);