package ewt.msvc.product.service.util;

public class Base64Util {

    private Base64Util() {

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
