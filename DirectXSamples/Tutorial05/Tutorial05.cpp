//--------------------------------------------------------------------------------------
// File: Tutorial05.cpp
//
// This application demonstrates animation using matrix transformations
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//--------------------------------------------------------------------------------------
#include <windows.h>
#include <d3d11.h>
#include <d3dx11.h>
#include <d3dcompiler.h>
#include <xnamath.h>
#include "resource.h"
#include <stdio.h>
#include <fstream>
#include <string>
#include <iostream>
#include <sstream>

//--------------------------------------------------------------------------------------
// Structures
//--------------------------------------------------------------------------------------
struct SimpleVertex
{
    XMFLOAT3 Pos;
    XMFLOAT4 Color;
	XMFLOAT2 texture;
	XMFLOAT3 Normal;
	XMFLOAT3 Tangent;
	XMFLOAT3 Binormal;
};


struct ConstantBuffer
{
	XMMATRIX mWorld;
	XMMATRIX mView;
	XMMATRIX mProjection;
	XMMATRIX mNormal;
};

struct ConstantBufferPS
{
	float time;
	XMFLOAT3 vecEye;
	float useTexture;
	float bump;
};


//--------------------------------------------------------------------------------------
// Global Variables
//--------------------------------------------------------------------------------------
HINSTANCE               g_hInst = NULL;
HWND                    g_hWnd = NULL;
D3D_DRIVER_TYPE         g_driverType = D3D_DRIVER_TYPE_NULL;
D3D_FEATURE_LEVEL       g_featureLevel = D3D_FEATURE_LEVEL_11_0;
ID3D11Device*           g_pd3dDevice = NULL;
ID3D11DeviceContext*    g_pImmediateContext = NULL;
IDXGISwapChain*         g_pSwapChain = NULL;
ID3D11RenderTargetView* g_pRenderTargetView = NULL;
ID3D11Texture2D*        g_pDepthStencil = NULL;
ID3D11DepthStencilView* g_pDepthStencilView = NULL;
ID3D11VertexShader*     g_pVertexShader = NULL;
ID3D11VertexShader*     g_pVertexShaderWF = NULL; //JPE
ID3D11PixelShader*      g_pPixelShader = NULL;
ID3D11PixelShader*      g_pPixelShaderWF = NULL; // JPE
ID3D11InputLayout*      g_pVertexLayout = NULL;
ID3D11Buffer*           g_pVertexBuffer = NULL;
ID3D11Buffer*           g_pIndexBuffer = NULL;
ID3D11Buffer*           g_pConstantBuffer = NULL;
ID3D11Buffer*           g_pConstantBufferPS = NULL;
XMMATRIX                g_World1;
XMMATRIX                g_World2;
XMMATRIX                g_View;
XMMATRIX                g_Projection;
// JPE
XMMATRIX                g_Normal1;


//--------------------------------------------------------------------------------------
// Forward declarations
//--------------------------------------------------------------------------------------
HRESULT InitWindow( HINSTANCE hInstance, int nCmdShow );
HRESULT InitDevice();
void CleanupDevice();
LRESULT CALLBACK    WndProc( HWND, UINT, WPARAM, LPARAM );
void Render();

// JPE: Enum
enum EnumModelo
{
	ModeloCubo = 0,
	ModeloMono = 1
};

// JPE: Variables
EnumModelo modelo = ModeloMono;

ID3D11ShaderResourceView* m_texture;
ID3D11ShaderResourceView* m_normalmap;
ID3D11ShaderResourceView* m_specularmap;
D3D11_SAMPLER_DESC samplerDesc;
ID3D11SamplerState* m_sampleState;
ID3D11RasterizerState* m_rasterState, *m_rasterStateWF;
long frameCount = 0, frameCountLast = 0, frameDelay = 100;
DWORD tIni, tAct, tAnt;
bool paused = false, restarted = false;
float dwLastT = 0;
bool rotate = true;
float bump = 1, useTexture = 0;
bool vsync = true;
POINT ptBeg, ptEnd;
bool fBlocking;
int cantVertices, cantIndices;
bool wireframe;
bool constBuffer = false;

// JPE: Funciones
void SetViewMatrix();
HRESULT loadTextures(ID3D11Device*);
float Largo(XMFLOAT3*);
void Normalize(XMFLOAT3*);
XMFLOAT3 Add(XMFLOAT3, XMFLOAT3);
XMFLOAT3 Substract(XMFLOAT3, XMFLOAT3);
XMFLOAT3 ProductoCruz(XMFLOAT3, XMFLOAT3);
float ProductoPunto(XMFLOAT3, XMFLOAT3);
void LoadVertices(SimpleVertex**, WORD**,int*,int*);
void LoadFileOFF(SimpleVertex**, WORD**, int*, int*);
void CalcularNormales(SimpleVertex*, const WORD*, const int, const int);
XMFLOAT3 MultEscalar(XMFLOAT3, float);
XMFLOAT3 DivEscalar(XMFLOAT3, float);

//--------------------------------------------------------------------------------------
// Entry point to the program. Initializes everything and goes into a message processing 
// loop. Idle time is used to render the scene.
//--------------------------------------------------------------------------------------
int WINAPI wWinMain( HINSTANCE hInstance, HINSTANCE hPrevInstance, LPWSTR lpCmdLine, int nCmdShow )
{
    UNREFERENCED_PARAMETER( hPrevInstance );
    UNREFERENCED_PARAMETER( lpCmdLine );

    if( FAILED( InitWindow( hInstance, nCmdShow ) ) )
        return 0;

    if( FAILED( InitDevice() ) )
    {
        CleanupDevice();
        return 0;
    }

	// JPE: Inicia contadores globales
	tIni = timeGetTime();
	tAnt = tIni;

    // Main message loop
    MSG msg = {0};
    while( WM_QUIT != msg.message )
    {
        if( PeekMessage( &msg, NULL, 0, 0, PM_REMOVE ) )
        {
            TranslateMessage( &msg );
            DispatchMessage( &msg );
        }
        else
        {
            Render();
        }
    }

    CleanupDevice();

    return ( int )msg.wParam;
}


//--------------------------------------------------------------------------------------
// Register class and create window
//--------------------------------------------------------------------------------------
HRESULT InitWindow( HINSTANCE hInstance, int nCmdShow )
{
    // Register class
    WNDCLASSEX wcex;
    wcex.cbSize = sizeof( WNDCLASSEX );
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.cbClsExtra = 0;
    wcex.cbWndExtra = 0;
    wcex.hInstance = hInstance;
    wcex.hIcon = LoadIcon( hInstance, ( LPCTSTR )IDI_TUTORIAL1 );
    wcex.hCursor = LoadCursor( NULL, IDC_ARROW );
    wcex.hbrBackground = ( HBRUSH )( COLOR_WINDOW + 1 );
    wcex.lpszMenuName = NULL;
    wcex.lpszClassName = L"TutorialWindowClass";
    wcex.hIconSm = LoadIcon( wcex.hInstance, ( LPCTSTR )IDI_TUTORIAL1 );
    if( !RegisterClassEx( &wcex ) )
        return E_FAIL;

    // Create window
    g_hInst = hInstance;
    RECT rc = { 0, 0, 640, 480 };
    AdjustWindowRect( &rc, WS_OVERLAPPEDWINDOW, FALSE );
    g_hWnd = CreateWindow( L"TutorialWindowClass", L"Direct3D 11 Tutorial 5", WS_OVERLAPPEDWINDOW,
                           CW_USEDEFAULT, CW_USEDEFAULT, rc.right - rc.left, rc.bottom - rc.top, NULL, NULL, hInstance,
                           NULL );
    if( !g_hWnd )
        return E_FAIL;

    ShowWindow( g_hWnd, nCmdShow );

    return S_OK;
}


//--------------------------------------------------------------------------------------
// Helper for compiling shaders with D3DX11
//--------------------------------------------------------------------------------------
HRESULT CompileShaderFromFile( WCHAR* szFileName, LPCSTR szEntryPoint, LPCSTR szShaderModel, ID3DBlob** ppBlobOut )
{
    HRESULT hr = S_OK;

    DWORD dwShaderFlags = D3DCOMPILE_ENABLE_STRICTNESS;
#if defined( DEBUG ) || defined( _DEBUG )
    // Set the D3DCOMPILE_DEBUG flag to embed debug information in the shaders.
    // Setting this flag improves the shader debugging experience, but still allows 
    // the shaders to be optimized and to run exactly the way they will run in 
    // the release configuration of this program.
    dwShaderFlags |= D3DCOMPILE_DEBUG;
#endif

    ID3DBlob* pErrorBlob;
    hr = D3DX11CompileFromFile( szFileName, NULL, NULL, szEntryPoint, szShaderModel, 
        dwShaderFlags, 0, NULL, ppBlobOut, &pErrorBlob, NULL );
    if( FAILED(hr) )
    {
        if( pErrorBlob != NULL )
            OutputDebugStringA( (char*)pErrorBlob->GetBufferPointer() );
        if( pErrorBlob ) pErrorBlob->Release();
        return hr;
    }
    if( pErrorBlob ) pErrorBlob->Release();

    return S_OK;
}


//--------------------------------------------------------------------------------------
// Create Direct3D device and swap chain
//--------------------------------------------------------------------------------------

float x=0.0f, y=0.0f, z=-5.0f;

HRESULT InitDevice()
{
	HRESULT hr = S_OK;

	RECT rc;
	GetClientRect(g_hWnd, &rc);
	UINT width = rc.right - rc.left;
	UINT height = rc.bottom - rc.top;

	UINT createDeviceFlags = 0;
#ifdef _DEBUG
	createDeviceFlags |= D3D11_CREATE_DEVICE_DEBUG;
#endif

	D3D_DRIVER_TYPE driverTypes[] =
	{
		D3D_DRIVER_TYPE_HARDWARE,
		D3D_DRIVER_TYPE_WARP,
		D3D_DRIVER_TYPE_REFERENCE,
	};
	UINT numDriverTypes = ARRAYSIZE(driverTypes);

	D3D_FEATURE_LEVEL featureLevels[] =
	{
		D3D_FEATURE_LEVEL_11_0,
		D3D_FEATURE_LEVEL_10_1,
		D3D_FEATURE_LEVEL_10_0,
	};
	UINT numFeatureLevels = ARRAYSIZE(featureLevels);

	DXGI_SWAP_CHAIN_DESC sd;
	ZeroMemory(&sd, sizeof(sd));
	sd.BufferCount = 1;
	sd.BufferDesc.Width = width;
	sd.BufferDesc.Height = height;
	sd.BufferDesc.Format = DXGI_FORMAT_R8G8B8A8_UNORM;
	sd.BufferDesc.RefreshRate.Numerator = 60;
	sd.BufferDesc.RefreshRate.Denominator = 1;
	sd.BufferUsage = DXGI_USAGE_RENDER_TARGET_OUTPUT;
	sd.OutputWindow = g_hWnd;
	sd.SampleDesc.Count = 1;
	sd.SampleDesc.Quality = 0;
	sd.Windowed = TRUE;
	sd.SwapEffect = DXGI_SWAP_EFFECT_DISCARD;

	for (UINT driverTypeIndex = 0; driverTypeIndex < numDriverTypes; driverTypeIndex++)
	{
		g_driverType = driverTypes[driverTypeIndex];
		hr = D3D11CreateDeviceAndSwapChain(NULL, g_driverType, NULL, createDeviceFlags, featureLevels, numFeatureLevels,
			D3D11_SDK_VERSION, &sd, &g_pSwapChain, &g_pd3dDevice, &g_featureLevel, &g_pImmediateContext);
		if (SUCCEEDED(hr))
			break;
	}
	if (FAILED(hr))
		return hr;

	// Create a render target view
	ID3D11Texture2D* pBackBuffer = NULL;
	hr = g_pSwapChain->GetBuffer(0, __uuidof(ID3D11Texture2D), (LPVOID*)&pBackBuffer);
	if (FAILED(hr))
		return hr;

	hr = g_pd3dDevice->CreateRenderTargetView(pBackBuffer, NULL, &g_pRenderTargetView);
	pBackBuffer->Release();
	if (FAILED(hr))
		return hr;

	// Create depth stencil texture
	D3D11_TEXTURE2D_DESC descDepth;
	ZeroMemory(&descDepth, sizeof(descDepth));
	descDepth.Width = width;
	descDepth.Height = height;
	descDepth.MipLevels = 1;
	descDepth.ArraySize = 1;
	descDepth.Format = DXGI_FORMAT_D24_UNORM_S8_UINT;
	descDepth.SampleDesc.Count = 1;
	descDepth.SampleDesc.Quality = 0;
	descDepth.Usage = D3D11_USAGE_DEFAULT;
	descDepth.BindFlags = D3D11_BIND_DEPTH_STENCIL;
	descDepth.CPUAccessFlags = 0;
	descDepth.MiscFlags = 0;
	hr = g_pd3dDevice->CreateTexture2D(&descDepth, NULL, &g_pDepthStencil);
	if (FAILED(hr))
		return hr;

	// Create the depth stencil view
	D3D11_DEPTH_STENCIL_VIEW_DESC descDSV;
	ZeroMemory(&descDSV, sizeof(descDSV));
	descDSV.Format = descDepth.Format;
	descDSV.ViewDimension = D3D11_DSV_DIMENSION_TEXTURE2D;
	descDSV.Texture2D.MipSlice = 0;
	hr = g_pd3dDevice->CreateDepthStencilView(g_pDepthStencil, &descDSV, &g_pDepthStencilView);
	if (FAILED(hr))
		return hr;

	g_pImmediateContext->OMSetRenderTargets(1, &g_pRenderTargetView, g_pDepthStencilView);

	// Setup the viewport
	D3D11_VIEWPORT vp;
	vp.Width = (FLOAT)width;
	vp.Height = (FLOAT)height;
	vp.MinDepth = 0.0f;
	vp.MaxDepth = 1.0f;
	vp.TopLeftX = 0;
	vp.TopLeftY = 0;
	g_pImmediateContext->RSSetViewports(1, &vp);

	// Compile the vertex shader
	ID3DBlob* pVSBlob = NULL;
	hr = CompileShaderFromFile(L"Tutorial05.fx", "VS", "vs_4_0", &pVSBlob);
	if (FAILED(hr))
	{
		MessageBox(NULL,
			L"The FX file cannot be compiled.  Please run this executable from the directory that contains the FX file.", L"Error", MB_OK);
		return hr;
	}

	// Create the vertex shader
	hr = g_pd3dDevice->CreateVertexShader(pVSBlob->GetBufferPointer(), pVSBlob->GetBufferSize(), NULL, &g_pVertexShader);
	if (FAILED(hr))
	{
		pVSBlob->Release();
		return hr;
	}

	// Define the input layout
	D3D11_INPUT_ELEMENT_DESC layout[] =
	{
		{ "POSITION", 0, DXGI_FORMAT_R32G32B32_FLOAT, 0, 0, D3D11_INPUT_PER_VERTEX_DATA, 0 },
		{ "COLOR", 0, DXGI_FORMAT_R32G32B32A32_FLOAT, 0, 12, D3D11_INPUT_PER_VERTEX_DATA, 0 },
		{ "TEXCOORD", 0,  DXGI_FORMAT_R32G32_FLOAT, 0, 28, D3D11_INPUT_PER_VERTEX_DATA, 0 },
		{ "NORMAL", 0,  DXGI_FORMAT_R32G32B32_FLOAT, 0, 36, D3D11_INPUT_PER_VERTEX_DATA, 0 },
		{ "TANGENT", 0,  DXGI_FORMAT_R32G32B32_FLOAT, 0, 48, D3D11_INPUT_PER_VERTEX_DATA, 0 },
		{ "BINORMAL", 0,  DXGI_FORMAT_R32G32B32_FLOAT, 0, 60, D3D11_INPUT_PER_VERTEX_DATA, 0 },
	};
	UINT numElements = ARRAYSIZE(layout);

	// Create the input layout
	hr = g_pd3dDevice->CreateInputLayout(layout, numElements, pVSBlob->GetBufferPointer(),
		pVSBlob->GetBufferSize(), &g_pVertexLayout);
	pVSBlob->Release();
	if (FAILED(hr))
		return hr;

	// Set the input layout
	g_pImmediateContext->IASetInputLayout(g_pVertexLayout);

	// Compile the pixel shader
	ID3DBlob* pPSBlob = NULL;
	hr = CompileShaderFromFile(L"Tutorial05.fx", "PS", "ps_4_0", &pPSBlob);
	if (FAILED(hr))
	{
		MessageBox(NULL,
			L"The FX file cannot be compiled.  Please run this executable from the directory that contains the FX file.", L"Error", MB_OK);
		return hr;
	}

	// Create the pixel shader
	hr = g_pd3dDevice->CreatePixelShader(pPSBlob->GetBufferPointer(), pPSBlob->GetBufferSize(), NULL, &g_pPixelShader);
	pPSBlob->Release();
	if (FAILED(hr))
		return hr;

	// -------------------------------------------------------------
	// JPE: Shaders para WireFrame
	// -------------------------------------------------------------
	// Compile the vertex shader
	ID3DBlob* pVSBlobWF = NULL;
	hr = CompileShaderFromFile(L"Tutorial05.fx", "VS_WF", "vs_4_0", &pVSBlobWF);
	if (FAILED(hr))
	{
		MessageBox(NULL,
			L"The FX file cannot be compiled.  Please run this executable from the directory that contains the FX file.", L"Error", MB_OK);
		return hr;
	}

	// Create the vertex shader
	hr = g_pd3dDevice->CreateVertexShader(pVSBlobWF->GetBufferPointer(), pVSBlobWF->GetBufferSize(), NULL, &g_pVertexShaderWF);
	pVSBlobWF->Release();
	if (FAILED(hr))
		return hr;

	// Compile the pixel shader
	ID3DBlob* pPSBlobWF = NULL;
	hr = CompileShaderFromFile(L"Tutorial05.fx", "PS_WF", "ps_4_0", &pPSBlobWF);
	if (FAILED(hr))
	{
		MessageBox(NULL,
			L"The FX file cannot be compiled.  Please run this executable from the directory that contains the FX file.", L"Error", MB_OK);
		return hr;
	}

	// Create the pixel shader
	hr = g_pd3dDevice->CreatePixelShader(pPSBlobWF->GetBufferPointer(), pPSBlobWF->GetBufferSize(), NULL, &g_pPixelShaderWF);
	pPSBlobWF->Release();
	if (FAILED(hr))
		return hr;

	// -------------------------------------------------------------

	// JPE: Create vertex buffer and index buffer
	SimpleVertex* vertices;
	WORD* indices;
	if (modelo == ModeloMono)
	{
		LoadFileOFF(&vertices, &indices, &cantVertices, &cantIndices);
	}
	else
	{
		LoadVertices(&vertices, &indices, &cantVertices, &cantIndices);
	}
	CalcularNormales(vertices, indices, cantVertices, cantIndices);

	
	// Crea Buffer para Vertices
    D3D11_BUFFER_DESC bd;
	ZeroMemory( &bd, sizeof(bd) );
    bd.Usage = D3D11_USAGE_DEFAULT;
    bd.ByteWidth = sizeof( SimpleVertex ) * cantVertices;
    bd.BindFlags = D3D11_BIND_VERTEX_BUFFER;
	bd.CPUAccessFlags = 0;
    D3D11_SUBRESOURCE_DATA InitData;
	ZeroMemory( &InitData, sizeof(InitData) );
    InitData.pSysMem = vertices;
    hr = g_pd3dDevice->CreateBuffer( &bd, &InitData, &g_pVertexBuffer );
    if( FAILED( hr ) )
        return hr;

    // Set vertex buffer
    UINT stride = sizeof( SimpleVertex );
    UINT offset = 0;
    g_pImmediateContext->IASetVertexBuffers( 0, 1, &g_pVertexBuffer, &stride, &offset );

	// Crea Buffer para Indexes
	bd.Usage = D3D11_USAGE_DEFAULT;
    bd.ByteWidth = sizeof( WORD ) * cantIndices;        // 36 vertices needed for 12 triangles in a triangle list
    bd.BindFlags = D3D11_BIND_INDEX_BUFFER;
	bd.CPUAccessFlags = 0;
    InitData.pSysMem = indices;
    hr = g_pd3dDevice->CreateBuffer( &bd, &InitData, &g_pIndexBuffer );
    if( FAILED( hr ) )
        return hr;

    // Set index buffer
    g_pImmediateContext->IASetIndexBuffer( g_pIndexBuffer, DXGI_FORMAT_R16_UINT, 0 );

    // Set primitive topology
    g_pImmediateContext->IASetPrimitiveTopology( D3D11_PRIMITIVE_TOPOLOGY_TRIANGLELIST );

	// Create the constant buffer
	bd.Usage = D3D11_USAGE_DEFAULT;
	bd.ByteWidth = sizeof(ConstantBuffer);
	bd.BindFlags = D3D11_BIND_CONSTANT_BUFFER;
	bd.CPUAccessFlags = 0;
    hr = g_pd3dDevice->CreateBuffer( &bd, NULL, &g_pConstantBuffer );
    if( FAILED( hr ) )
        return hr;

	// JPE: Create the constant buffer for PixelShader
	bd.Usage = D3D11_USAGE_DEFAULT;
	bd.ByteWidth = sizeof(ConstantBufferPS);
	bd.BindFlags = D3D11_BIND_SHADER_RESOURCE;
	bd.CPUAccessFlags = 0;
	hr = g_pd3dDevice->CreateBuffer(&bd, NULL, &g_pConstantBufferPS);
	if (FAILED(hr))
		return hr;

    // Initialize the world matrix
	g_World1 = XMMatrixIdentity();
	g_World2 = XMMatrixIdentity();

	SetViewMatrix();

    // Initialize the projection matrix
	g_Projection = XMMatrixPerspectiveFovLH( XM_PIDIV2, width / (FLOAT)height, 0.01f, 100.0f );

	// JPE: Texturas
	loadTextures(g_pd3dDevice);

	// JPE: Raster state
	///*
	D3D11_RASTERIZER_DESC rasterDesc;

	// Setup the raster description which will determine how and what polygons will be drawn.
	rasterDesc.AntialiasedLineEnable = false;
	rasterDesc.CullMode = D3D11_CULL_BACK;
	rasterDesc.DepthBias = 0;
	rasterDesc.DepthBiasClamp = 0.0f;
	rasterDesc.DepthClipEnable = true;
	rasterDesc.FillMode = D3D11_FILL_SOLID;
	rasterDesc.FrontCounterClockwise = false;
	rasterDesc.MultisampleEnable = false;
	rasterDesc.ScissorEnable = false;
	rasterDesc.SlopeScaledDepthBias = 0.0f;

	// Create the rasterizer state from the description we just filled out.
	hr = g_pd3dDevice->CreateRasterizerState(&rasterDesc, &m_rasterState);
	if (FAILED(hr))
	{
		return hr;
	}

	// Now set the rasterizer state.
	g_pImmediateContext->RSSetState(m_rasterState);
	//*/

	// JPE: Raster state para WireFrame
	// Setup the raster description which will determine how and what polygons will be drawn.
	rasterDesc.AntialiasedLineEnable = false;
	rasterDesc.CullMode = D3D11_CULL_BACK;
	rasterDesc.DepthBias = 0;
	rasterDesc.DepthBiasClamp = 0.0f;
	rasterDesc.DepthClipEnable = true;
	rasterDesc.FillMode = D3D11_FILL_WIREFRAME;
	rasterDesc.FrontCounterClockwise = false;
	rasterDesc.MultisampleEnable = false;
	rasterDesc.ScissorEnable = false;
	rasterDesc.SlopeScaledDepthBias = 0.0f;

	// Create the rasterizer state from the description we just filled out.
	hr = g_pd3dDevice->CreateRasterizerState(&rasterDesc, &m_rasterStateWF);
	if (FAILED(hr))
	{
		return hr;
	}


	// JPE: Parametros default
	if (modelo == ModeloMono)
	{
		bump = false;
		useTexture = false;
		rotate = false;
	}

    return S_OK;
}

void SetViewMatrix()
{
	// Initialize the view matrix
	XMVECTOR Eye = XMVectorSet(x, y, z, 0.0f);
	//XMVECTOR At = XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f);
	XMVECTOR At = XMVectorSet(x, y, z+1.0f, 0.0f);
	XMVECTOR Up = XMVectorSet(0.0f, 1.0f, 0.0f, 0.0f);
	g_View = XMMatrixLookAtLH(Eye, At, Up);

}


//--------------------------------------------------------------------------------------
// Clean up the objects we've created
//--------------------------------------------------------------------------------------
void CleanupDevice()
{
    if( g_pImmediateContext ) g_pImmediateContext->ClearState();

    if( g_pConstantBuffer ) g_pConstantBuffer->Release();
	if (g_pConstantBufferPS) g_pConstantBufferPS->Release();
    if( g_pVertexBuffer ) g_pVertexBuffer->Release();
    if( g_pIndexBuffer ) g_pIndexBuffer->Release();
    if( g_pVertexLayout ) g_pVertexLayout->Release();
    if( g_pVertexShader ) g_pVertexShader->Release();
    if( g_pPixelShader ) g_pPixelShader->Release();
    if( g_pDepthStencil ) g_pDepthStencil->Release();
    if( g_pDepthStencilView ) g_pDepthStencilView->Release();
    if( g_pRenderTargetView ) g_pRenderTargetView->Release();
    if( g_pSwapChain ) g_pSwapChain->Release();
    if( g_pImmediateContext ) g_pImmediateContext->Release();
    if( g_pd3dDevice ) g_pd3dDevice->Release();
}


//--------------------------------------------------------------------------------------
// Called every time the application receives a message
//--------------------------------------------------------------------------------------
LRESULT CALLBACK WndProc( HWND hWnd, UINT message, WPARAM wParam, LPARAM lParam )
{
    PAINTSTRUCT ps;
    HDC hdc;

	float step = 0.1f;
	bool cambiaView = false;

	switch( message )
    {
        case WM_PAINT:
            hdc = BeginPaint( hWnd, &ps );
            EndPaint( hWnd, &ps );
            break;

        case WM_DESTROY:
            PostQuitMessage( 0 );
            break;

		case WM_KEYDOWN:
			switch (wParam)
			{
			case 0x57: // W
				z += step; cambiaView = true;
				break;
			case 0x53: // S
				z -= step; cambiaView = true;
				break;
			case 0x41: // A
				x -= step; cambiaView = true;
				break;
			case 0x44: // D
				x += step; cambiaView = true;
				break;
			case 0x51: // Q
				y += step; cambiaView = true;
				break;
			case 0x45: // E
				y -= step; cambiaView = true;
				break;
			case 0x42: // B
				bump = (float)(((int)bump + 1) % 2);
				break;
			case 0x56: // V
				vsync = !vsync;
				break;
			case 'T':
				useTexture = (float)(((int)useTexture + 1) % 2);
				break;
			case 'C':
				x = 0.0f, y = 0.0f, z = -5.0f;
				cambiaView = true;
				break;
			case 'P':
				paused = !paused;
				if (!paused)
				{
					restarted = true;
				}
				break;
			case 'R':
				rotate = !rotate;
				break;
			case 'M':
				if (modelo == ModeloMono)
					modelo = ModeloCubo;
				else if (modelo == ModeloCubo)
					modelo = ModeloMono;

				break;
			case 'F':
				wireframe = !wireframe;
				/*
				if ( !wireframe )
				{
					g_pImmediateContext->RSSetState(m_rasterState);
				}
				else
				{
					g_pImmediateContext->RSSetState(m_rasterStateWF);
				}
				*/
				
				break;
			}
			if (cambiaView)
				SetViewMatrix();
			break;

		case WM_LBUTTONDOWN:
			ptBeg.x = ptEnd.x = LOWORD(lParam);
			ptBeg.y = ptEnd.y = HIWORD(lParam);

			SetCursor(LoadCursor(NULL, IDC_CROSS));

			fBlocking = TRUE;
			return 0;

		case WM_MOUSEMOVE:
			if (fBlocking)
			{
				SetCursor(LoadCursor(NULL, IDC_CROSS));

				ptEnd.x = LOWORD(lParam);
				ptEnd.y = HIWORD(lParam);

				x += (ptEnd.x - ptBeg.x) / 4.0f;
				y += (ptEnd.y - ptBeg.y) / 4.0f;

				ptBeg.x = ptEnd.x;
				ptBeg.y = ptEnd.y;

				SetViewMatrix();
			}
			return 0;

		case WM_LBUTTONUP:
			if (fBlocking)
			{
				SetCursor(LoadCursor(NULL, IDC_ARROW));

				fBlocking = FALSE;
			}
			return 0;
        default:
            return DefWindowProc( hWnd, message, wParam, lParam );
    }

    return 0;
}

//--------------------------------------------------------------------------------------
// Render a frame
//--------------------------------------------------------------------------------------
void Render()
{
	// Update our time
	static float t = 0.0f;
	if (!paused)
	{
		if (g_driverType == D3D_DRIVER_TYPE_REFERENCE)
		{
			t += (float)XM_PI * 0.0125f;
		}
		else
		{
			static DWORD dwTimeStart = 0;
			DWORD dwTimeCur = GetTickCount();
			if (dwTimeStart == 0)
				dwTimeStart = dwTimeCur;
			if (restarted)
			{
				restarted = false;
				t = dwLastT;
				dwTimeStart = dwTimeCur - t * 1000.0f;
			}
			else
			{
				t = (dwTimeCur - dwTimeStart) / 1000.0f;
			}
		}
		dwLastT = t;
	}

	// 1st Cube: Rotate around the origin
	// JPE : Se verifica si debe rotar
	if (rotate)
	{
		//JPE: Para mesh del mono
		if (modelo == ModeloMono)
		{
			g_World1 = XMMatrixRotationX(-1.570796f) * XMMatrixRotationY(t);
		}
		else // Para cubo
		{
			g_World1 = XMMatrixRotationY(t);
		}
	}
	else
	{
		//JPE: Para mesh del mono
		if (modelo == ModeloMono)
		{
			g_World1 = XMMatrixRotationX(-1.570796f);
			g_World1 *= XMMatrixRotationY(2 * -1.570796f);
		}
		else // Para cubo
		{
			g_World1 = XMMatrixIdentity();
		}
	}
	XMVECTOR Det;
	g_Normal1 = XMMatrixTranspose(XMMatrixInverse(&Det, g_World1));

	// 2nd Cube:  Rotate around origin
	XMMATRIX mSpin = XMMatrixRotationZ(-t);
	XMMATRIX mOrbit = XMMatrixRotationY(-t * 2.0f);
	XMMATRIX mTranslate = XMMatrixTranslation(-4.0f, 0.0f, 0.0f);
	XMMATRIX mScale = XMMatrixScaling(0.3f, 0.3f, 0.3f);

	g_World2 = mScale * mSpin * mTranslate * mOrbit;

	//
	// Clear the back buffer
	//
	float ClearColor[4] = { 0.0f, 0.125f, 0.3f, 1.0f }; //red, green, blue, alpha
	g_pImmediateContext->ClearRenderTargetView(g_pRenderTargetView, ClearColor);

	//
	// Clear the depth buffer to 1.0 (max depth)
	//
	g_pImmediateContext->ClearDepthStencilView(g_pDepthStencilView, D3D11_CLEAR_DEPTH, 1.0f, 0);


	// JPE:	
	// CARGA LOS CONSTANT BUFFERS
	if (!constBuffer)
	{
		g_pImmediateContext->PSSetConstantBuffers(1, 1, &g_pConstantBufferPS);
		g_pImmediateContext->VSSetConstantBuffers(0, 1, &g_pConstantBuffer);
		g_pImmediateContext->VSSetConstantBuffers(1, 1, &g_pConstantBufferPS);
		// Set shader texture resource in the pixel shader.
		g_pImmediateContext->PSSetShaderResources(0, 1, &m_texture);
		g_pImmediateContext->PSSetShaderResources(1, 1, &m_normalmap);
		g_pImmediateContext->PSSetShaderResources(2, 1, &m_specularmap);
		// Set the sampler state in the pixel shader.
		g_pImmediateContext->PSSetSamplers(0, 1, &m_sampleState);

		constBuffer = true;
	}

	//
	// Update variables for the first cube
	//
	ConstantBuffer cb1;
	cb1.mWorld = XMMatrixTranspose(g_World1);
	cb1.mView = XMMatrixTranspose(g_View);
	cb1.mProjection = XMMatrixTranspose(g_Projection);
	cb1.mNormal = XMMatrixTranspose(g_Normal1);
	//
	// Update variables for the second cube
	//
	ConstantBuffer cb2;
	cb2.mWorld = XMMatrixTranspose(g_World2);
	cb2.mView = XMMatrixTranspose(g_View);
	cb2.mProjection = XMMatrixTranspose(g_Projection);

	// JPE: variables for PS
	ConstantBufferPS psCb1;
	psCb1.time = t;
	psCb1.vecEye = XMFLOAT3(x, y, z);
	psCb1.bump = bump;
	psCb1.useTexture = useTexture;

	// FIRST PASS
	g_pImmediateContext->RSSetState(m_rasterState);
	g_pImmediateContext->VSSetShader(g_pVertexShader, NULL, 0);
	g_pImmediateContext->PSSetShader(g_pPixelShader, NULL, 0);

	// Render the first cube
	g_pImmediateContext->UpdateSubresource(g_pConstantBuffer, 0, NULL, &cb1, 0, 0);
	g_pImmediateContext->UpdateSubresource(g_pConstantBufferPS, 0, NULL, &psCb1, 0, 0);
	g_pImmediateContext->DrawIndexed( cantIndices, 0, 0 );
	// Render the second cube
	g_pImmediateContext->UpdateSubresource( g_pConstantBuffer, 0, NULL, &cb2, 0, 0 );
	g_pImmediateContext->DrawIndexed(cantIndices, 0, 0);
	
    // SECOND PASS
	if (wireframe)
	{
		g_pImmediateContext->RSSetState(m_rasterStateWF);
		g_pImmediateContext->VSSetShader(g_pVertexShaderWF, NULL, 0);
		g_pImmediateContext->PSSetShader(g_pPixelShaderWF, NULL, 0);

		// Render the first cube
		g_pImmediateContext->UpdateSubresource(g_pConstantBuffer, 0, NULL, &cb1, 0, 0);
		g_pImmediateContext->UpdateSubresource(g_pConstantBufferPS, 0, NULL, &psCb1, 0, 0);
		g_pImmediateContext->DrawIndexed(cantIndices, 0, 0);
		// Render the second cube
		g_pImmediateContext->UpdateSubresource(g_pConstantBuffer, 0, NULL, &cb2, 0, 0);
		g_pImmediateContext->DrawIndexed(cantIndices, 0, 0);
	}

    //
    // Present our back buffer to our front buffer
    //
	// JPE: primer parametro = 1 para Vertical Sync, 0 para Inmediato
	UINT SyncInterval = vsync ? 1: 0;
    g_pSwapChain->Present(SyncInterval, 0 );

	frameCount++;
	
	if (frameCount % frameDelay == 0)
	{
		DWORD tAct = timeGetTime();

		DWORD elapsed = tAct - tAnt;
		long frames = frameCount - frameCountLast;
		float fps = frames / (elapsed / 1000.0f);


		frameDelay = fps / 5;

		if (frameDelay < 10) frameDelay = 10;

		wchar_t text[256];

		swprintf(text, 256, L"FPS = %.1f", fps);

		SetWindowTextW(g_hWnd, text);

		frameCountLast = frameCount;
		tAnt = tAct;
	}
}


//--------------------------------------------------------------------------------------
// JPE: Load Texture
//--------------------------------------------------------------------------------------
HRESULT loadTextures(ID3D11Device* d3d11Device)
{
	//LPCWSTR pathTexture = L"C:\\Users\\yapjpe\\Documents\\Visual Studio 2010\\Projects\\DirectXSamples\\Textures\\images.dds";
	LPCWSTR pathTexture = L"C:\\Users\\yapjpe\\Desktop\\tmp\\imagenes\\HexagonTile_DIFF.png";
	LPCWSTR pathNormalMap = L"C:\\Users\\yapjpe\\Desktop\\tmp\\imagenes\\mono_norm.jpg"; 
	LPCWSTR pathSpecularMap = NULL; // L"C:\\Users\\yapjpe\\Desktop\\tmp\\imagenes\\HexagonTile_SPEC.png";
	// jpg: circulo_norm  mono_norm cara_norm formas_norm  ice1_n  sandbag-diff sandbag-nor
	// png: rabbit-june5_2006-img_0075_nm.png HexagonTile_NRM HexagonTile_DIFF HexagonTile_SPEC

	HRESULT hr;
	hr = D3DX11CreateShaderResourceViewFromFile(d3d11Device, pathTexture,
		NULL, NULL, &m_texture, NULL);
	if (FAILED(hr))
	{
		return hr;
	}

	// Create a texture sampler state description.
	samplerDesc.Filter = D3D11_FILTER_MIN_MAG_MIP_LINEAR;
	samplerDesc.AddressU = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressV = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.AddressW = D3D11_TEXTURE_ADDRESS_WRAP;
	samplerDesc.MipLODBias = 0.0f;
	samplerDesc.MaxAnisotropy = 1;
	samplerDesc.ComparisonFunc = D3D11_COMPARISON_ALWAYS;
	samplerDesc.BorderColor[0] = 0;
	samplerDesc.BorderColor[1] = 0;
	samplerDesc.BorderColor[2] = 0;
	samplerDesc.BorderColor[3] = 0;
	samplerDesc.MinLOD = 0;
	samplerDesc.MaxLOD = D3D11_FLOAT32_MAX;

	// Create the texture sampler state.
	hr = d3d11Device->CreateSamplerState(&samplerDesc, &m_sampleState);
	if (FAILED(hr))
	{
		return hr;
	}

	// Carga el normal map.
	hr = D3DX11CreateShaderResourceViewFromFile(d3d11Device, pathNormalMap,
		NULL, NULL, &m_normalmap, NULL);
	if (FAILED(hr))
	{
		return hr;
	}

	// Carga el normal map.
	hr = D3DX11CreateShaderResourceViewFromFile(d3d11Device, pathSpecularMap,
		NULL, NULL, &m_specularmap, NULL);
	if (FAILED(hr))
	{
		return hr;
	}

	return hr;
}

/////////////////////////////////////////////////////////////////
// JPE: Ayudas para vectores
/////////////////////////////////////////////////////////////////
float Largo(XMFLOAT3* vector)
{
	return sqrtf(vector->x * vector->x + vector->y * vector->y + vector->z * vector->z);
}
void Normalize(XMFLOAT3* vector)
{
	float largo = Largo(vector);
	vector->x /= largo;
	vector->y /= largo;
	vector->z /= largo;
}

XMFLOAT3 Add(XMFLOAT3 vectorA, XMFLOAT3 vectorB)
{
	XMFLOAT3 result = XMFLOAT3(vectorA.x + vectorB.x, vectorA.y + vectorB.y, vectorA.z + vectorB.z);
	return result;
}

XMFLOAT3 Substract(XMFLOAT3 vectorA, XMFLOAT3 vectorB)
{
	XMFLOAT3 result = XMFLOAT3 ( vectorA.x - vectorB.x, vectorA.y - vectorB.y, vectorA.z - vectorB.z ) ;
	return result;
}

XMFLOAT3 ProductoCruz(XMFLOAT3 vectorA, XMFLOAT3 vectorB)
{
	float ux = vectorA.x, uy = vectorA.y, uz = vectorA.z;
	float vx = vectorB.x, vy = vectorB.y, vz = vectorB.z;
	float wx, wy, wz;

	wx = uy*vz - uz*vy;
	wy = uz*vx - ux*vz;
	wz = ux*vy - uy*vx;

	return XMFLOAT3(wx, wy, wz);
}

float ProductoPunto(XMFLOAT3 vectorA, XMFLOAT3 vectorB)
{
	return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
}

XMFLOAT3 MultEscalar(XMFLOAT3 vectorA, float escalar)
{
	return XMFLOAT3(vectorA.x * escalar, vectorA.y * escalar, vectorA.z * escalar);
}

XMFLOAT3 DivEscalar(XMFLOAT3 vectorA, float escalar)
{
	return XMFLOAT3(vectorA.x / escalar, vectorA.y / escalar, vectorA.z / escalar);
}


/////////////////////////////////////////////////////////////////
// JPE: Cargar Vertices
/////////////////////////////////////////////////////////////////
void LoadVertices(SimpleVertex** verticesDest, WORD** indicesDest, int* cantVertices, int* cantIndices )
{
	SimpleVertex* vertices = new SimpleVertex[24]();
	*(verticesDest) = vertices;
	*(cantVertices) = 24;

	// CARA ARRIBA
	vertices[0] = { XMFLOAT3(-1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(0.0f, 1.0f, 0.0f) }; // 0 
	vertices[1] = { XMFLOAT3(1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(0.0f, 1.0f, 0.0f) }; // 1
	vertices[2] = { XMFLOAT3(1.0f, 1.0f, 1.0f), XMFLOAT4(0.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(0.0f, 1.0f, 0.0f) }; // 2	
	vertices[3] = { XMFLOAT3(-1.0f, 1.0f, 1.0f), XMFLOAT4(1.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(0.0f, 1.0f, 0.0f) }; // 3	
	// CARA ABAJO
	vertices[4] = { XMFLOAT3(-1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(0.0f, -1.0f, 0.0f) }; // 4
	vertices[5] = { XMFLOAT3(1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(0.0f, -1.0f, 0.0f) }; // 5
	vertices[6] = { XMFLOAT3(1.0f, -1.0f, 1.0f), XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(0.0f, -1.0f, 0.0f) }; // 6
	vertices[7] = { XMFLOAT3(-1.0f, -1.0f, 1.0f), XMFLOAT4(0.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(0.0f, -1.0f, 0.0f) }; // 7
	// CARA FRENTE
	vertices[8] = { XMFLOAT3(-1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(0.0f, 0.0f, -1.0f) }; // 0
	vertices[9] = { XMFLOAT3(1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(0.0f, 0.0f, -1.0f) }; // 1
	vertices[10] = { XMFLOAT3(1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(0.0f, 0.0f, -1.0f) }; // 5
	vertices[11] = { XMFLOAT3(-1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(0.0f, 0.0f, -1.0f) }; // 4
	// CARA DORSO
	vertices[12] = { XMFLOAT3(1.0f, 1.0f, 1.0f), XMFLOAT4(0.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(0.0f, 0.0f, 1.0f) }; // 2		
	vertices[13] = { XMFLOAT3(-1.0f, 1.0f, 1.0f), XMFLOAT4(1.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(0.0f, 0.0f, 1.0f) }; // 3	
	vertices[14] = { XMFLOAT3(-1.0f, -1.0f, 1.0f), XMFLOAT4(0.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(0.0f, 0.0f, 1.0f) }; // 7	
	vertices[15] = { XMFLOAT3(1.0f, -1.0f, 1.0f), XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(0.0f, 0.0f, 1.0f) }; // 6	
	// CARA DERECHA
	vertices[16] = { XMFLOAT3(1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(1.0f, 0.0f, 0.0f) }; // 1	
	vertices[17] = { XMFLOAT3(1.0f, 1.0f, 1.0f), XMFLOAT4(0.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(1.0f, 0.0f, 0.0f) }; // 2		
	vertices[18] = { XMFLOAT3(1.0f, -1.0f, 1.0f), XMFLOAT4(1.0f, 1.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(1.0f, 0.0f, 0.0f) }; // 6	
	vertices[19] = { XMFLOAT3(1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 1.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(1.0f, 0.0f, 0.0f) }; // 5	
	// CARA IZQUIERDA
	vertices[20] = { XMFLOAT3(-1.0f, 1.0f, 1.0f), XMFLOAT4(1.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(-1.0f, 0.0f, 0.0f) }; // 3	
	vertices[21] = { XMFLOAT3(-1.0f, 1.0f, -1.0f), XMFLOAT4(0.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 0.0f), XMFLOAT3(-1.0f, 0.0f, 0.0f) }; // 0	
	vertices[22] = { XMFLOAT3(-1.0f, -1.0f, -1.0f), XMFLOAT4(1.0f, 0.0f, 1.0f, 1.0f), XMFLOAT2(1.0f, 1.0f), XMFLOAT3(-1.0f, 0.0f, 0.0f) }; // 4	
	vertices[23] = { XMFLOAT3(-1.0f, -1.0f, 1.0f), XMFLOAT4(0.0f, 0.0f, 0.0f, 1.0f), XMFLOAT2(0.0f, 1.0f), XMFLOAT3(-1.0f, 0.0f, 0.0f) }; // 7	

	// Create index buffer
	int cantInd = 36;
	*(cantIndices) = cantInd;
	
	const WORD indices[] =
	{
		// ARRIBA
		3,2,1,
		3,1,0,
		// ABAJO
		4,5,6,
		4,6,7,
		// FRENTE
		8,9,10,
		8,10,11,
		// DORSO
		12,13,14,
		12,14,15,
		// DERECHA
		16,17,18,
		16,18,19,
		// IZQUIERDA
		20,21,22,
		20,22,23,
	};

	*(indicesDest) = new WORD[cantInd];
	memcpy(*(indicesDest), (void*)indices, cantInd * sizeof(WORD));

	//JPE: Calculo de normales, tangentes y binormales.
	for (int cara = 0; cara < 6; cara++)
	{
		for (int trig = 0; trig < 2; trig++)
		{
			int idx0 = cara * 6 + trig * 3;
			int idx1 = idx0 + 1, idx2 = idx0 + 2;

			SimpleVertex& vt0 = vertices[indices[idx0]];
			SimpleVertex& vt1 = vertices[indices[idx1]];
			SimpleVertex& vt2 = vertices[indices[idx2]];

			XMFLOAT3 p0 = vt0.Pos;
			XMFLOAT3 p1 = vt1.Pos;
			XMFLOAT3 p2 = vt2.Pos;

			XMFLOAT2 t0 = vt0.texture;
			XMFLOAT2 t1 = vt1.texture;
			XMFLOAT2 t2 = vt2.texture;

			XMFLOAT3 Edge1 = XMFLOAT3(p1.x - p0.x, p1.y - p0.y, p1.z - p0.z);
			XMFLOAT3 Edge2 = XMFLOAT3(p2.x - p0.x, p2.y - p0.y, p2.z - p0.z);

			float DeltaU1 = t1.x - t0.x;
			float DeltaV1 = t1.y - t0.y;
			float DeltaU2 = t2.x - t0.x;
			float DeltaV2 = t2.y - t0.y;

			float f = 1.0f / (DeltaU1 * DeltaV2 - DeltaU2 * DeltaV1);

			XMFLOAT3 Tangent, Bitangent;

			Tangent.x = f * (DeltaV2 * Edge1.x - DeltaV1 * Edge2.x);
			Tangent.y = f * (DeltaV2 * Edge1.y - DeltaV1 * Edge2.y);
			Tangent.z = f * (DeltaV2 * Edge1.z - DeltaV1 * Edge2.z);

			Bitangent.x = f * (-DeltaU2 * Edge1.x - DeltaU1 * Edge2.x);
			Bitangent.y = f * (-DeltaU2 * Edge1.y - DeltaU1 * Edge2.y);
			Bitangent.z = f * (-DeltaU2 * Edge1.z - DeltaU1 * Edge2.z);

			Normalize(&Tangent);
			Normalize(&Bitangent);

			vt0.Tangent = Tangent;
			vt1.Tangent = Tangent;
			vt2.Tangent = Tangent;

			vt0.Binormal = Bitangent;
			vt1.Binormal = Bitangent;
			vt2.Binormal = Bitangent;

		}
	}

}

/////////////////////////////////////////////////////////////////
// JPE: Cargar Vertices desde archivo OFF
/////////////////////////////////////////////////////////////////
void LoadFileOFF(SimpleVertex** verticesDest, WORD** indicesDest, int* cantVerticesDest, int* cantIndicesDest)
{
	std::string path = "C:\\Users\\yapjpe\\Desktop\\tmp\\imagenes\\monkey_V2.off";
	// OFF FILES: space_shuttle    space_station     monkey    monkey_V4
	std::ifstream infile(path);

	bool procesoEncabezado = false, procesoLineaUno = false, error = false;
	std::string line;

	int numVertices, numFaces, numEdges;

	while (std::getline(infile, line))
	{
		bool comentario = false;
		
		if (line[0] == '#')
		{
			comentario = true;
		}
		if (!comentario)
		{
			if (!procesoEncabezado)
			{
				procesoEncabezado = true;
				if (line.size() < 3)
					error = true;
				if (!(line[0] == 'O' && line[1] == 'F' && line[2] == 'F'))
					error = true;
				else
					OutputDebugStringA("<ENCABEZADO>: ");
			}
			else if ( !procesoLineaUno )
			{
				procesoLineaUno = true;
				std::istringstream iss(line);
				iss >> numVertices >> numFaces >> numEdges;
				OutputDebugStringA("<LINEA_UNO>: ");
			}
			else
			{
				OutputDebugStringA("<ERROR>: ");
			}
		}
		else
		{
			OutputDebugStringA("<COMENTARIO>: ");
		}
		OutputDebugStringA((LPCSTR)line.c_str());
		OutputDebugStringA("\r\n");
		if (error) break;
		if (procesoEncabezado && procesoLineaUno) break;
	}
	
	if (!error)
	{
		SimpleVertex* vertices = new SimpleVertex[numVertices]();

		for (int i = 0; i < numVertices; i++)
		{
			std::getline(infile, line);
			std::istringstream iss(line);
			float x, y, z;
			iss >> x >> y >> z;
			std::string s;
			s = ((std::string)"<VERTICE>: ");
			s += ((std::string)"[X]: ") + std::to_string(x) + " - ";
			s += ((std::string)"[Y]: ") + std::to_string(y) + " - ";
			s += ((std::string)"[Z]: ") + std::to_string(z);
			s += "\r\n";
			OutputDebugStringA((LPCSTR)s.c_str());
			vertices[i] = { XMFLOAT3(x, y, z), XMFLOAT4(0.5f, 0.5f, 0.5f, 1.0f), XMFLOAT2(0.0f, 0.0f), XMFLOAT3(0.0f, 0.0f, 0.0f) };
		}

		if (verticesDest != NULL)
			*(verticesDest) = vertices;
		*(cantVerticesDest) = numVertices;
		
		WORD* listaIndices = new WORD[numFaces*5*3];
		int indicePos = 0;

		for (int i = 0; i < numFaces; i++)
		{
			std::getline(infile, line);
			std::istringstream iss(line);
			int cantInd;
			iss >> cantInd;
			int *indices = new int[cantInd]();
			for (int j = 0; j < cantInd ; j++ )
			{
				int valor;
				iss >> valor;
				indices[j] = valor;
			}
			std::string s;
			s = ((std::string)"<FACE>: ");
			s += ((std::string)"Cant Indices : ") + std::to_string(cantInd) + " - ";
			for ( int j = 0 ; j < cantInd ; j++ )
			{
				s += ((std::string)"[") + std::to_string(j) + "]: " + std::to_string(indices[j]) + " - ";
			}
			s += "\r\n";
			OutputDebugStringA((LPCSTR)s.c_str());

			for (int t = 0; t < (cantInd - 2); t++)
			{
				int v0 = 0, v1 = (t + 1) % cantInd, v2 = (t + 2) % cantInd;
				listaIndices[indicePos+0] = indices[v0];
				listaIndices[indicePos+1] = indices[v1]; 
				listaIndices[indicePos+2] = indices[v2];
				indicePos += 3;
			}

			delete[] indices;
		}
		

		if (indicesDest != NULL)
			*(indicesDest) = listaIndices;

		*(cantIndicesDest) = indicePos;
	}

}

void CalcularNormales(SimpleVertex* vertices, const WORD* indices, const int cantVertices, const int cantIndices)
{
	int cantTrig = cantIndices / 3;
	for (int t = 0; t < cantTrig; t++)
	{
		int i0 = t * 3;
		int i1 = i0 + 1, i2 = i0 + 2;

		SimpleVertex& vx0 = vertices[indices[i0]];
		SimpleVertex& vx1 = vertices[indices[i1]];
		SimpleVertex& vx2 = vertices[indices[i2]];

		XMFLOAT3 p1 = Substract(vx1.Pos, vx0.Pos);
		XMFLOAT3 p2 = Substract(vx2.Pos, vx0.Pos);
		XMFLOAT3 normal = ProductoCruz(p1, p2);
		Normalize(&normal);

		if (vx0.Normal.x == 0 && vx0.Normal.y == 0 && vx0.Normal.z == 0)
			vx0.Normal = normal;
		else
			vx0.Normal = DivEscalar(Add(vx0.Normal,normal),2);

		if (vx1.Normal.x == 0 && vx1.Normal.y == 0 && vx1.Normal.z == 0)
			vx1.Normal = normal;
		else
			vx1.Normal = DivEscalar(Add(vx1.Normal, normal), 2);

		if (vx2.Normal.x == 0 && vx2.Normal.y == 0 && vx2.Normal.z == 0)
			vx2.Normal = normal;
		else
			vx2.Normal = DivEscalar(Add(vx2.Normal, normal), 2);
	}
}


/*
void AbrirConsola()
{
	AllocConsole();
	freopen("CONIN$", "r", stdin);
	freopen("CONOUT$", "w", stdout);
	freopen("CONOUT$", "w", stderr);
}
*/