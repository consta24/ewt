package ewt.msvc.config.utils;

public class StringUtil {

    private StringUtil() {

    }

    public static String toTitleCase(String givenString) {
        String[] arr = givenString.trim().split(" ");
        StringBuilder sb = new StringBuilder();

        for (String s : arr) {
            sb.append(Character.toUpperCase(s.charAt(0)))
                    .append(s.substring(1).toLowerCase()).append(" ");
        }
        return sb.toString().trim();
    }
}
