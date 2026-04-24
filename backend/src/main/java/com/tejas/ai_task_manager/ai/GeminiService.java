package com.tejas.ai_task_manager.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private final String URL =
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=";

    private final ObjectMapper mapper = new ObjectMapper();

    // ✅ Builds JSON body safely using ObjectMapper (no injection/escaping issues)
    private String buildRequestBody(String prompt) throws Exception {
        ObjectNode root = mapper.createObjectNode();
        ArrayNode contents = mapper.createArrayNode();
        ObjectNode content = mapper.createObjectNode();
        ArrayNode parts = mapper.createArrayNode();
        ObjectNode part = mapper.createObjectNode();

        part.put("text", prompt);       // ObjectMapper handles escaping automatically
        parts.add(part);
        content.set("parts", parts);
        contents.add(content);
        root.set("contents", contents);

        return mapper.writeValueAsString(root);
    }

    private String callGemini(String prompt) throws Exception {
        String body = buildRequestBody(prompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        // ✅ Log the raw response to help debug on Render
        System.out.println("Gemini raw response: " + response.body());

        JsonNode responseRoot = mapper.readTree(response.body());

        // ✅ Check for API-level errors returned in response body
        if (responseRoot.has("error")) {
            String errorMsg = responseRoot.path("error").path("message").asText();
            throw new RuntimeException("Gemini API error: " + errorMsg);
        }

        return responseRoot
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText()
                .trim();
    }

    public String generateDescription(String title) {
        try {
           System.out.println("Key being used: [" + apiKey + "]");
            String prompt = "Generate a short, clear, 1-2 line task description only. " +
                            "No headings, no options. Task: " + title;
            return callGemini(prompt);
        } catch (Exception e) {
                    return "ERROR: " + e.getClass().getName() + " | " + e.getMessage();// ✅ Will now show real error in Render logs
            // return "Error generating description";
        }
    }

    public String generatePriority(String description) {
        try {
            String prompt = "Based on this task, return ONLY one word: HIGH, MEDIUM, or LOW. Task: " + description;
            return callGemini(prompt);
        } catch (Exception e) {
            e.printStackTrace();
            return "MEDIUM";
        }
    }
}