package htmp.codien.quanlycodien.modules.menu.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GroupMenuConverter implements AttributeConverter<GroupMenu, String> {

    @Override
    public String convertToDatabaseColumn(GroupMenu attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name();
    }

    @Override
    public GroupMenu convertToEntityAttribute(String dbData) {

        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        try {
            return GroupMenu.valueOf(dbData.trim());
        } catch (IllegalArgumentException e) {

            return null;
        }
    }
}
