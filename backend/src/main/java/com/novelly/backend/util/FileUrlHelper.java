package com.novelly.backend.util;

import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

public final class FileUrlHelper {

    private static final String PAGE_FILE_ENDPOINT = "/api/pages/file";

    private FileUrlHelper() {
    }

    public static String buildFileUrl(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return null;
        }
        String encoded = UriUtils.encode(relativePath, StandardCharsets.UTF_8);
        return PAGE_FILE_ENDPOINT + "?path=" + encoded;
    }
}
