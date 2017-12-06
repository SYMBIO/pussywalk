package com.pussywalk.game;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import fi.iki.

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = new WebView(this);
        setContentView(webView);

        SimpleWebServer server = new SimpleWebServer(8080, this.getAssets());
        server.run();
        server.start();

        webView.loadUrl("http://localhost:8080/");
        webView.setWebViewClient(new WebViewClient());
    }
}
