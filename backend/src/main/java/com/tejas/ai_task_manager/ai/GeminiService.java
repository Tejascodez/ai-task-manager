package com.tejas.ai_task_manager.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

private final String URL =
"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=";
    public String generateDescription(String title) {

        try {
String prompt = "Generate a short, clear, 1-2 line task description only. No headings, no options. Task: " + title;

            String body = """
            {
              "contents": [{
                "parts": [{
                  "text": "%s"
                }]
              }]
            }
            """.formatted(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(URL + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            // 🔥 Extract only useful text
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.body());

            return root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating description";
        }
    }

    public String generatePriority(String description) {

    try {
        String prompt = "Based on this task, return ONLY one word: HIGH, MEDIUM, or LOW. Task: " + description;

        String body = """
        {
          "contents": [{
            "parts": [{
              "text": "%s"
            }]
          }]
        }
        """.formatted(prompt);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode root = mapper.readTree(response.body());

        return root
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText()
                .trim();

    } catch (Exception e) {
        return "MEDIUM"; // fallback
    }
}
}