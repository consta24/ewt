package ewt.msvc.product.service.util;

import java.util.regex.Pattern;

public class Base64Util {

    private Base64Util() {

    }

    public static boolean isLikelyBase64(String s) {
        return (s.length() % 4 == 0) && Pattern.matches("^[A-Za-z0-9+/]*[=]{0,3}$", s);
    }

    public static String getContentTypeFromBase64(String base64) {
        String[] parts = base64.split(",");
        String[] metaParts = parts[0].split(";");
        return metaParts[0].replace("data:", "");
    }

    public static String getFileExtensionFromBase64(String base64) {
        String contentType = getContentTypeFromBase64(base64);
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> throw new RuntimeException("Content type is not valid");
        };
    }
}
