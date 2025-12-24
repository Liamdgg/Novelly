package com.novelly.backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {
    // store file under optional subDir (e.g. "novels/{comicId}/chapters/{chapterId}")
    // returns stored relative path (use this value in DB)
    String store(org.springframework.web.multipart.MultipartFile file, String subDir);

    Resource loadAsResource(String relativePath);

    Path getRootLocation();

    // delete file by its relative path
    void delete(String relativePath);
}