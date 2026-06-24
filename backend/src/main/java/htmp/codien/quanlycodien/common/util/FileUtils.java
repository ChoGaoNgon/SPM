package htmp.codien.quanlycodien.common.util;

import java.io.InputStream;
import java.security.MessageDigest;

public class FileUtils {

    public static String getFileChecksum(InputStream inputStream) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5"); 
        byte[] buffer = new byte[8192];
        int read;
        while ((read = inputStream.read(buffer)) != -1) {
            md.update(buffer, 0, read);
        }
        byte[] digest = md.digest();

        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
