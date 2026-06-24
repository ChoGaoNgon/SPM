package htmp.codien.quanlycodien.modules.menu.enums;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class GroupMenuDeserializer extends JsonDeserializer<GroupMenu> {

    @Override
    public GroupMenu deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();

        if (value == null || value.trim().isEmpty() || "null".equalsIgnoreCase(value)) {
            return null;
        }

        try {
            return GroupMenu.valueOf(value);
        } catch (IllegalArgumentException e) {

            return null;
        }
    }
}
