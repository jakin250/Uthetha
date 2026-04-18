from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True, slots=True)
class LanguageOption:
    id: str
    label: str
    lang: str | None
    tld: str | None
    supported: bool
    note: str

    def to_dict(self) -> dict[str, str | bool | None]:
        return asdict(self)


LANGUAGE_OPTIONS = [
    LanguageOption("english-uk", "English UK", "en", "co.uk", True, "Routes English speech through Google United Kingdom for a British accent."),
    LanguageOption("english-us", "English US", "en", "com", True, "Uses Google's default English voice, which is the closest gTTS match for US English."),
    LanguageOption("english-sa", "English SA", "en", "co.za", True, "Routes English speech through Google South Africa for a South African accent."),
    LanguageOption("afrikaans", "Afrikaans", "af", "com", True, "Standard Afrikaans voice from Google Text-to-Speech."),
    LanguageOption("arabic", "Arabic", "ar", "com", True, "Standard Arabic voice from Google Text-to-Speech."),
    LanguageOption("bengali", "Bengali", "bn", "com", True, "Standard Bengali voice from Google Text-to-Speech."),
    LanguageOption("chinese-simplified", "Chinese (Simplified)", "zh-CN", "com", True, "Mandarin speech using the Simplified Chinese voice in gTTS."),
    LanguageOption("chinese-traditional", "Chinese (Traditional)", "zh-TW", "com", True, "Mandarin speech using the Traditional Chinese voice in gTTS."),
    LanguageOption("dutch", "Dutch", "nl", "com", True, "Standard Dutch voice from Google Text-to-Speech."),
    LanguageOption("french", "French", "fr", "com", True, "Standard French voice from Google Text-to-Speech."),
    LanguageOption("german", "German", "de", "com", True, "Standard German voice from Google Text-to-Speech."),
    LanguageOption("greek", "Greek", "el", "com", True, "Standard Greek voice from Google Text-to-Speech."),
    LanguageOption("gujarati", "Gujarati", "gu", "com", True, "Standard Gujarati voice from Google Text-to-Speech."),
    LanguageOption("hausa", "Hausa", "ha", "com", True, "Standard Hausa voice from Google Text-to-Speech."),
    LanguageOption("hindi", "Hindi", "hi", "com", True, "Standard Hindi voice from Google Text-to-Speech."),
    LanguageOption("igbo", "Igbo", None, None, False, "Igbo is not currently available in the installed gTTS language set."),
    LanguageOption("indonesian", "Indonesian", "id", "com", True, "Standard Indonesian voice from Google Text-to-Speech."),
    LanguageOption("italian", "Italian", "it", "com", True, "Standard Italian voice from Google Text-to-Speech."),
    LanguageOption("japanese", "Japanese", "ja", "com", True, "Standard Japanese voice from Google Text-to-Speech."),
    LanguageOption("korean", "Korean", "ko", "com", True, "Standard Korean voice from Google Text-to-Speech."),
    LanguageOption("portuguese", "Portuguese", "pt", "com", True, "Uses the Brazilian Portuguese voice exposed by gTTS."),
    LanguageOption("sepedi", "Sepedi", None, None, False, "Sepedi is not currently available in the installed gTTS language set."),
    LanguageOption("russian", "Russian", "ru", "com", True, "Standard Russian voice from Google Text-to-Speech."),
    LanguageOption("spanish", "Spanish", "es", "com", True, "Standard Spanish voice from Google Text-to-Speech."),
    LanguageOption("sotho", "Sotho", None, None, False, "Sotho is not currently available in the installed gTTS language set."),
    LanguageOption("southern-ndebele", "Southern Ndebele", None, None, False, "Southern Ndebele is not currently available in the installed gTTS language set."),
    LanguageOption("swahili", "Swahili", "sw", "com", True, "Standard Swahili voice from Google Text-to-Speech."),
    LanguageOption("swazi", "Swazi", None, None, False, "Swazi is not currently available in the installed gTTS language set."),
    LanguageOption("turkish", "Turkish", "tr", "com", True, "Standard Turkish voice from Google Text-to-Speech."),
    LanguageOption("tsonga", "Tsonga", None, None, False, "Tsonga is not currently available in the installed gTTS language set."),
    LanguageOption("tswana", "Tswana", None, None, False, "Tswana is not currently available in the installed gTTS language set."),
    LanguageOption("ukrainian", "Ukrainian", "uk", "com", True, "Standard Ukrainian voice from Google Text-to-Speech."),
    LanguageOption("urdu", "Urdu", "ur", "com", True, "Standard Urdu voice from Google Text-to-Speech."),
    LanguageOption("venda", "Venda", None, None, False, "Venda is not currently available in the installed gTTS language set."),
    LanguageOption("vietnamese", "Vietnamese", "vi", "com", True, "Standard Vietnamese voice from Google Text-to-Speech."),
    LanguageOption("xhosa", "Xhosa", None, None, False, "Xhosa is not currently available in the installed gTTS language set."),
    LanguageOption("yoruba", "Yoruba", None, None, False, "Yoruba is not currently available in the installed gTTS language set."),
    LanguageOption("zulu", "Zulu", None, None, False, "Zulu is not currently available in the installed gTTS language set."),
]

LANGUAGE_PAYLOAD = [option.to_dict() for option in LANGUAGE_OPTIONS]
LANGUAGE_OPTIONS_BY_ID = {option["id"]: option for option in LANGUAGE_PAYLOAD}
