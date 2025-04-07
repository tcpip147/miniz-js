#include "script.h"

int size_of_pointer()
{
    return sizeof(void *);
}

int size_of_size_t()
{
    return sizeof(size_t);
}

unsigned char *c_zip(FileEntry *files, size_t num_files, size_t *buf_size)
{
    mz_zip_archive zip_archive;
    memset(&zip_archive, 0, sizeof(zip_archive));

    if (!mz_zip_writer_init_heap(&zip_archive, 0, 0))
    {
        printf("Failed to initialize zip archive\n");
        return NULL;
    }

    for (size_t i = 0; i < num_files; i++)
    {
        if (!mz_zip_writer_add_mem(&zip_archive, files[i].name, files[i].data, strlen(files[i].data), MZ_BEST_COMPRESSION))
        {
            printf("Failed to add file to zip archive\n");
            mz_zip_writer_end(&zip_archive);
            return NULL;
        }
    }

    void *p_zip = NULL;
    if (!mz_zip_writer_finalize_heap_archive(&zip_archive, &p_zip, buf_size))
    {
        printf("Failed to finalize zip archive\n");
        mz_zip_writer_end(&zip_archive);
        return NULL;
    }

    mz_zip_writer_end(&zip_archive);
    return (unsigned char *)p_zip;
}

FileEntry *c_unzip(unsigned char *data, size_t buf_size, size_t *num_files)
{
    mz_zip_archive zip_archive;
    memset(&zip_archive, 0, sizeof(zip_archive));

    if (!mz_zip_reader_init_mem(&zip_archive, data, buf_size, 0))
    {
        printf("Failed to initialize zip reader\n");
        return NULL;
    }

    *num_files = mz_zip_reader_get_num_files(&zip_archive);
    FileEntry *files = (FileEntry *)malloc(*num_files * sizeof(FileEntry));
    if (!files)
    {
        printf("Failed to allocate memory for files\n");
        mz_zip_reader_end(&zip_archive);
        return NULL;
    }

    for (size_t i = 0; i < *num_files; i++)
    {
        mz_zip_archive_file_stat file_stat;
        if (!mz_zip_reader_file_stat(&zip_archive, i, &file_stat))
        {
            printf("Failed to get file stat for file %zu\n", i);
            free(files);
            mz_zip_reader_end(&zip_archive);
            return NULL;
        }

        files[i].name = strdup(file_stat.m_filename);
        size_t m_uncomp_size = (size_t)file_stat.m_uncomp_size;
        files[i].data = (char *)malloc(m_uncomp_size + 1);
        if (!files[i].data || !mz_zip_reader_extract_to_mem(&zip_archive, i, (void *)files[i].data, m_uncomp_size, 0))
        {
            printf("Failed to allocate memory for file data\n");
            for (size_t j = 0; j < i; j++)
            {
                free((void *)files[j].name);
                if (j == i - 1)
                {
                    free((void *)files[j + 1].name);
                }
                free((void *)files[j].data);
            }
            free(files);
            mz_zip_reader_end(&zip_archive);
            return NULL;
        }
        files[i].data[m_uncomp_size] = '\0';
    }

    mz_zip_reader_end(&zip_archive);
    return files;
}

int main()
{
    FileEntry files[3] = {
        {"file1.txt", "Hello world1"},
        {"file2.txt", "Hello world2"},
        {"file3.txt", "Hello world3"},
    };
    size_t buf_size;
    unsigned char *ptr = c_zip(files, 3, &buf_size);
    printf("buf_size: %zu\n", buf_size);

    size_t num_files;
    c_unzip(ptr, buf_size, &num_files);
    printf("num_files: %zu\n", num_files);
    for (size_t i = 0; i < num_files; i++)
    {
        printf("%s: %s\n", files[i].name, files[i].data);
    }
    return 0;
}