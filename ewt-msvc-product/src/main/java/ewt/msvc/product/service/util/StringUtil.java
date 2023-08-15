package ewt.msvc.product.service.util;

public class StringUtil {

    private StringUtil() {

    }

    public static String toTitleCase(String givenString) {
        String[] arr = givenString.split(" ");
        StringBuilder sb = new StringBuilder();

        for (String s : arr) {
            sb.append(Character.toUpperCase(s.charAt(0)))
                    .append(s.substring(1).toLowerCase()).append(" ");
        }
        return sb.toString().trim();
    }
}
