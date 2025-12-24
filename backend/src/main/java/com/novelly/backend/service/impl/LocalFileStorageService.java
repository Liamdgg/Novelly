package com.novelly.backend.service.impl;

import com.novelly.backend.service.FileStorageService;
import com.novelly.backend.service.exception.FileStorageException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocalFileStorageService implements FileStorageService {

    // Logger for debugging
    private static final Logger log = LoggerFactory.getLogger(LocalFileStorageService.class);   

    @Value("${file.storage.location:./uploads}")
    private String storageLocation;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        this.rootLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        // Log the resolved root location for debugging
        log.info("File storage location property: {}", storageLocation);
        log.info("Resolved root location: {}", rootLocation);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new FileStorageException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file, String subDir) {
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        if (original == null || original.isBlank()) {
            throw new FileStorageException("Invalid file name");
        }
        if (original.contains("..")) {
            throw new FileStorageException("Filename contains invalid path sequence " + original);
        }

        String ext = "";
        int i = original.lastIndexOf('.');
        if (i > 0) ext = original.substring(i);

        String filename = UUID.randomUUID().toString() + ext;
        Path targetDir = (subDir == null || subDir.isBlank())
                ? rootLocation
                : rootLocation.resolve(subDir).normalize();

        try {
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(filename).normalize();
            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            Path relative = rootLocation.relativize(target);
            return relative.toString().replace("\\", "/");
        } catch (IOException e) {
            throw new FileStorageException("Failed to store file " + original, e);
        }
    }

    @Override
    public Resource loadAsResource(String relativePath) {
        try {
            Path file = rootLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileStorageException("File not found: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new FileStorageException("File not found: " + relativePath, e);
        }
    }

    @Override
    public void delete(String relativePath) {
        try {
            Path file = rootLocation.resolve(relativePath).normalize();
            if (!file.startsWith(rootLocation)) {
                throw new FileStorageException("Attempt to delete file outside storage location");
            }
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new FileStorageException("Failed to delete file: " + relativePath, e);
        }
    }

    @Override
    public Path getRootLocation() {
        return rootLocation;
    }
}