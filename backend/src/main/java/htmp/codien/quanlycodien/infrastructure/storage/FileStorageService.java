package htmp.codien.quanlycodien.infrastructure.storage;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Comparator;
import java.util.UUID;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import htmp.codien.quanlycodien.modules.newmodel.product.enums.FileUploadProductType;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không hợp lệ hoặc rỗng");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalName = sanitizeFilename(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "_" + originalName;

        Path targetPath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        return filename;
    }

    public String saveProductAttachment(
            String modelCode,
            String productCode,
            String nameFolder,
            FileUploadProductType subName,
            MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File không hợp lệ hoặc rỗng");
            }

            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();

            Path targetDir = basePath.resolve("models").resolve(modelCode);

            if (productCode != null) {
                targetDir = basePath
                        .resolve("models")
                        .resolve(modelCode)
                        .resolve(productCode);
            }

            if (nameFolder != null && !nameFolder.isBlank()) {
                targetDir = targetDir.resolve(nameFolder);
            }

            if (subName != null) {
                targetDir = targetDir.resolve(subName.getFolderName());
            }

            Files.createDirectories(targetDir);

            String sanitizedName = sanitizeFilename(file.getOriginalFilename());
            Path filePath = resolveUniqueFilename(targetDir, sanitizedName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Path relativePath = basePath.relativize(filePath);
            return relativePath.toString().replace("\\", "/");

        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file: " + e.getMessage(), e);
        }
    }

    public String duplicateProductAttachment(
            String sourceRelativePath,
            String modelCode,
            String productCode,
            String nameFolder) {
        try {
            if (sourceRelativePath == null || sourceRelativePath.isBlank()) {
                throw new IllegalArgumentException("Đường dẫn file nguồn không hợp lệ");
            }

            Path basePath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path sourcePath = basePath.resolve(sourceRelativePath).normalize();

            if (!sourcePath.startsWith(basePath)) {
                throw new RuntimeException("Đường dẫn file nguồn không hợp lệ: " + sourceRelativePath);
            }
            if (!Files.exists(sourcePath)) {
                throw new RuntimeException("File nguồn không tồn tại: " + sourceRelativePath);
            }

            Path targetDir = basePath.resolve("models").resolve(modelCode);
            if (productCode != null && !productCode.isBlank()) {
                targetDir = targetDir.resolve(productCode);
            }
            if (nameFolder != null && !nameFolder.isBlank()) {
                targetDir = targetDir.resolve(nameFolder);
            }

            Files.createDirectories(targetDir);

            String fileName = sanitizeFilename(sourcePath.getFileName().toString());
            Path targetPath = resolveUniqueFilename(targetDir, fileName);
            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);

            return basePath.relativize(targetPath).toString().replace("\\", "/");
        } catch (IOException e) {
            throw new RuntimeException("Không thể sao chép file: " + e.getMessage(), e);
        }
    }

    public Resource loadFile(String relativePath) throws MalformedURLException {
        Path filePath = Paths.get(uploadDir).resolve(relativePath).normalize();
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new RuntimeException("File không tồn tại: " + relativePath);
        }
        return resource;
    }

    public void deleteFile(String relativePath) {
        try {
            Path file = Paths.get(uploadDir).resolve(relativePath).normalize();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            System.err.println("Không thể xóa file: " + relativePath + ". Lỗi: " + e.getMessage());
        }
    }

    public void deleteFolder(String relativePath) {
        Path targetPath = Paths.get(uploadDir).resolve(relativePath).normalize();
        try {
            if (Files.exists(targetPath)) {
                Files.walk(targetPath)
                        .sorted(Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(File::delete);

                System.out.println("✅ Đã xóa thư mục: " + targetPath);
            } else {
                System.out.println("⚠️ Không tìm thấy thư mục: " + targetPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Không thể xóa thư mục " + relativePath + ": " + e.getMessage(), e);
        }
    }

    public InputStream getFileInputStream(String relativePath) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(relativePath).normalize();
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File không tồn tại: " + relativePath);
            }
            return Files.newInputStream(filePath);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi mở file: " + e.getMessage(), e);
        }
    }

    private String sanitizeFilename(String originalName) {
        if (originalName == null)
            return "file";

        String cleaned = Paths.get(originalName).getFileName().toString();

        cleaned = cleaned.replaceAll("[\\\\/:*?\"<>|]", "_");
        return cleaned;
    }

    private Path resolveUniqueFilename(Path targetDir, String originalName) {
        Path filePath = targetDir.resolve(originalName);
        String name = FilenameUtils.getBaseName(originalName);
        String ext = FilenameUtils.getExtension(originalName);

        int counter = 1;
        while (Files.exists(filePath)) {
            String newName = ext.isEmpty()
                    ? String.format("%s_(%d)", name, counter)
                    : String.format("%s_(%d).%s", name, counter, ext);
            filePath = targetDir.resolve(newName);
            counter++;
        }
        return filePath;
    }

    public String storeFile(MultipartFile file, String targetDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không hợp lệ hoặc rỗng");
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(targetDir);
            Files.createDirectories(uploadPath);

            String originalName = sanitizeFilename(file.getOriginalFilename());

            Path targetPath = uploadPath.resolve(originalName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return originalName;
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file: " + e.getMessage(), e);
        }
    }
}